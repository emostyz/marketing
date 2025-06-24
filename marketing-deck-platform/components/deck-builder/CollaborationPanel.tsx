'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  X, Users, MessageCircle, Send, Eye, Edit, Clock,
  Share2, Link2, Mail, Copy, Check, UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface CollaborationPanelProps {
  presentation: any
  onClose: () => void
}

export function CollaborationPanel({ presentation, onClose }: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState('comments')
  const [newComment, setNewComment] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [shareLink, setShareLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)

  const mockComments = [
    {
      id: 1,
      user: { name: 'Sarah Johnson', avatar: '', initials: 'SJ' },
      message: 'The chart on slide 3 could use more contrast',
      timestamp: '2 hours ago',
      slideIndex: 2,
      resolved: false
    },
    {
      id: 2,
      user: { name: 'Mike Chen', avatar: '', initials: 'MC' },
      message: 'Great insight on the Q4 trends!',
      timestamp: '1 day ago',
      slideIndex: 4,
      resolved: true
    }
  ]

  const mockCollaborators = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah@company.com',
      role: 'editor',
      status: 'online',
      avatar: '',
      initials: 'SJ'
    },
    {
      id: 2,
      name: 'Mike Chen',
      email: 'mike@company.com',
      role: 'viewer',
      status: 'offline',
      avatar: '',
      initials: 'MC'
    }
  ]

  const generateShareLink = () => {
    const link = `${window.location.origin}/presentations/${presentation.id}/share?token=abc123`
    setShareLink(link)
  }

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareLink)
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl border-l border-gray-200 z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Collaboration</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3 m-4">
          <TabsTrigger value="comments">Comments</TabsTrigger>
          <TabsTrigger value="collaborators">People</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="comments" className="h-full p-4 pt-0">
            <div className="flex flex-col h-full">
              {/* Comments List */}
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-4">
                  {mockComments.map((comment) => (
                    <Card key={comment.id} className={`${comment.resolved ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user.avatar} />
                            <AvatarFallback className="text-xs">{comment.user.initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium">{comment.user.name}</span>
                              <span className="text-xs text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="text-sm text-gray-700">{comment.message}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                Slide {comment.slideIndex + 1}
                              </Badge>
                              {comment.resolved && (
                                <Badge variant="secondary" className="text-xs">
                                  <Check className="w-3 h-3 mr-1" />
                                  Resolved
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* New Comment */}
              <div className="space-y-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="resize-none"
                  rows={3}
                />
                <Button className="w-full" size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Post Comment
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="collaborators" className="h-full p-4 pt-0">
            <div className="space-y-4">
              {/* Invite New Collaborator */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Invite People</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Email Address</Label>
                    <Input
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Role</Label>
                    <Select value={inviteRole} onValueChange={setInviteRole}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="viewer">
                          <div className="flex items-center space-x-2">
                            <Eye className="w-4 h-4" />
                            <span>Viewer</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center space-x-2">
                            <Edit className="w-4 h-4" />
                            <span>Editor</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" size="sm">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Send Invitation
                  </Button>
                </CardContent>
              </Card>

              {/* Current Collaborators */}
              <div>
                <Label className="text-sm font-medium">Current Collaborators</Label>
                <div className="mt-2 space-y-2">
                  {mockCollaborators.map((collaborator) => (
                    <Card key={collaborator.id}>
                      <CardContent className="p-3">
                        <div className="flex items-center space-x-3">
                          <div className="relative">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={collaborator.avatar} />
                              <AvatarFallback className="text-xs">{collaborator.initials}</AvatarFallback>
                            </Avatar>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                              collaborator.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{collaborator.name}</div>
                            <div className="text-xs text-gray-500 truncate">{collaborator.email}</div>
                          </div>
                          <Badge variant={collaborator.role === 'editor' ? 'default' : 'secondary'} className="text-xs">
                            {collaborator.role}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="share" className="h-full p-4 pt-0">
            <div className="space-y-4">
              {/* Share Link */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Share Link</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label className="text-xs">Anyone with this link can view</Label>
                    <div className="flex space-x-2 mt-1">
                      <Input
                        value={shareLink}
                        readOnly
                        placeholder="Click 'Generate Link' to create"
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyShareLink}
                        disabled={!shareLink}
                      >
                        {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    className="w-full" 
                    size="sm" 
                    onClick={generateShareLink}
                    disabled={!!shareLink}
                  >
                    <Link2 className="w-4 h-4 mr-2" />
                    Generate Share Link
                  </Button>
                </CardContent>
              </Card>

              {/* Export Options */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Export & Share</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Mail className="w-4 h-4 mr-2" />
                    Send via Email
                  </Button>
                  <Button variant="outline" className="w-full justify-start" size="sm">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share to Social Media
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">Sarah edited slide 3</span>
                      <span className="text-gray-400">2h ago</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">Mike added a comment</span>
                      <span className="text-gray-400">1d ago</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">Presentation created</span>
                      <span className="text-gray-400">3d ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </motion.div>
  )
}