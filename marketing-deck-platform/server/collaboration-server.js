const { createServer } = require('http')
const { Server } = require('socket.io')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = 3001

// Create Next.js app
const app = next({ dev, hostname, port })
const handler = app.getRequestHandler()

// Store active presentations and users
const activePresentations = new Map()
const userSessions = new Map()

app.prepare().then(() => {
  const httpServer = createServer(handler)
  
  const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000", "http://localhost:3001"],
      methods: ["GET", "POST"]
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔗 User connected: ${socket.id}`)

    // Join presentation room
    socket.on('join-presentation', ({ presentationId, user }) => {
      console.log(`👤 User ${user.name} joined presentation ${presentationId}`)
      
      // Leave any existing rooms
      Array.from(socket.rooms).forEach(room => {
        if (room !== socket.id) {
          socket.leave(room)
        }
      })
      
      // Join new room
      socket.join(presentationId)
      
      // Store user session
      userSessions.set(socket.id, { ...user, presentationId, socketId: socket.id })
      
      // Get or create presentation
      if (!activePresentations.has(presentationId)) {
        activePresentations.set(presentationId, {
          id: presentationId,
          users: new Map(),
          comments: new Map(),
          lastUpdate: Date.now()
        })
      }
      
      const presentation = activePresentations.get(presentationId)
      presentation.users.set(socket.id, { ...user, socketId: socket.id })
      
      // Notify other users in the room
      socket.to(presentationId).emit('user-joined', { ...user, socketId: socket.id })
      
      // Send current users list to the new user
      const currentUsers = Array.from(presentation.users.values())
      socket.emit('current-users', currentUsers)
      
      // Send current comments to the new user
      const currentComments = Array.from(presentation.comments.values())
      socket.emit('current-comments', currentComments)
    })

    // Leave presentation
    socket.on('leave-presentation', (presentationId) => {
      handleUserDisconnect(socket, presentationId)
    })

    // Handle cursor updates
    socket.on('cursor-update', ({ position }) => {
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        socket.to(userSession.presentationId).emit('user-cursor-update', {
          userId: userSession.id,
          position
        })
      }
    })

    // Handle selection updates
    socket.on('selection-update', ({ selection }) => {
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        socket.to(userSession.presentationId).emit('user-selection-update', {
          userId: userSession.id,
          selection
        })
      }
    })

    // Handle slide updates
    socket.on('update-slide', ({ slideId, updates }) => {
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        const presentation = activePresentations.get(userSession.presentationId)
        if (presentation) {
          presentation.lastUpdate = Date.now()
          
          // Broadcast to other users in the presentation
          socket.to(userSession.presentationId).emit('slide-updated', {
            slideId,
            updates,
            userId: userSession.id
          })
        }
      }
    })

    // Handle presentation updates
    socket.on('update-presentation', (updates) => {
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        const presentation = activePresentations.get(userSession.presentationId)
        if (presentation) {
          presentation.lastUpdate = Date.now()
          
          // Broadcast to other users in the presentation
          socket.to(userSession.presentationId).emit('presentation-updated', {
            ...updates,
            userId: userSession.id
          })
        }
      }
    })

    // Handle comments
    socket.on('add-comment', (comment) => {
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        const presentation = activePresentations.get(userSession.presentationId)
        if (presentation) {
          presentation.comments.set(comment.id, comment)
          
          // Broadcast to all users in the presentation
          io.to(userSession.presentationId).emit('comment-added', comment)
        }
      }
    })

    socket.on('reply-to-comment', ({ commentId, reply }) => {
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        const presentation = activePresentations.get(userSession.presentationId)
        if (presentation && presentation.comments.has(commentId)) {
          const comment = presentation.comments.get(commentId)
          if (!comment.replies) comment.replies = []
          comment.replies.push(reply)
          
          // Broadcast to all users in the presentation
          io.to(userSession.presentationId).emit('comment-updated', comment)
        }
      }
    })

    socket.on('resolve-comment', (commentId) => {
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        const presentation = activePresentations.get(userSession.presentationId)
        if (presentation && presentation.comments.has(commentId)) {
          const comment = presentation.comments.get(commentId)
          comment.resolved = true
          
          // Broadcast to all users in the presentation
          io.to(userSession.presentationId).emit('comment-updated', comment)
        }
      }
    })

    socket.on('delete-comment', (commentId) => {
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        const presentation = activePresentations.get(userSession.presentationId)
        if (presentation && presentation.comments.has(commentId)) {
          presentation.comments.delete(commentId)
          
          // Broadcast to all users in the presentation
          io.to(userSession.presentationId).emit('comment-deleted', commentId)
        }
      }
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.id}`)
      const userSession = userSessions.get(socket.id)
      if (userSession) {
        handleUserDisconnect(socket, userSession.presentationId)
      }
    })
  })

  function handleUserDisconnect(socket, presentationId) {
    const userSession = userSessions.get(socket.id)
    if (userSession) {
      // Remove user from presentation
      const presentation = activePresentations.get(presentationId)
      if (presentation) {
        presentation.users.delete(socket.id)
        
        // Notify other users
        socket.to(presentationId).emit('user-left', userSession.id)
        
        // Clean up empty presentations after 5 minutes
        if (presentation.users.size === 0) {
          setTimeout(() => {
            const currentPresentation = activePresentations.get(presentationId)
            if (currentPresentation && currentPresentation.users.size === 0) {
              activePresentations.delete(presentationId)
              console.log(`🗑️ Cleaned up empty presentation: ${presentationId}`)
            }
          }, 5 * 60 * 1000) // 5 minutes
        }
      }
      
      // Remove user session
      userSessions.delete(socket.id)
    }
  }

  // Health check endpoint
  httpServer.on('request', (req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status: 'healthy',
        activePresentations: activePresentations.size,
        connectedUsers: userSessions.size,
        timestamp: new Date().toISOString()
      }))
      return
    }
    
    // Let Next.js handle other requests
    handler(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`🚀 Collaboration server running on http://${hostname}:${port}`)
    console.log(`🔗 Socket.IO server ready for connections`)
  })

  // Cleanup inactive presentations every hour
  setInterval(() => {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    
    for (const [presentationId, presentation] of activePresentations.entries()) {
      if (now - presentation.lastUpdate > oneHour && presentation.users.size === 0) {
        activePresentations.delete(presentationId)
        console.log(`🗑️ Cleaned up inactive presentation: ${presentationId}`)
      }
    }
  }, 60 * 60 * 1000) // Run every hour
})