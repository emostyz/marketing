import Skeleton from '../components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Skeleton width={320} height={40} className="mb-4" />
      <Skeleton width={480} height={20} className="mb-2" />
      <Skeleton width={480} height={20} className="mb-2" />
      <Skeleton width={240} height={20} />
    </div>
  )
} 