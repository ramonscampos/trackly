interface Activity {
  action: string
  organization: string
  project: string
  time: string
  hours?: string
}

interface ActivityCardProps {
  activities: Activity[]
}

export function ActivityCard({ activities }: ActivityCardProps) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800/50 p-6 backdrop-blur-sm">
      <h3 className="mb-4 font-semibold text-lg text-white">
        Atividades Recentes
      </h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div className="flex items-start space-x-3" key={index}>
            <div className="mt-2 h-2 w-2 rounded-full bg-blue-400" />
            <div className="flex-1">
              <p className="text-gray-200 text-sm">
                {activity.action}
                {activity.hours && (
                  <span className="text-gray-400"> • {activity.hours}</span>
                )}
              </p>
              <p className="text-gray-500 text-xs">
                {activity.organization} • {activity.project} • {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
