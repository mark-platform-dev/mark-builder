import { createRoot } from 'react-dom/client'
import intro from './data/intro.yaml'
import roadmap from './data/roadmap.yaml'
import metrics from './data/metrics.yaml'
import team from './data/team.json'
import Intro from './components/Intro.jsx'
import Timeline from './components/Timeline.jsx'
import MetricsTable from './components/MetricsTable.jsx'

createRoot(document.getElementById('root')).render(
  <main className="mx-auto max-w-3xl p-10 font-sans">
    <Intro d={intro} team={team} />
    <Timeline d={roadmap} heading={intro.timelineHeading} />
    <MetricsTable
      metrics={metrics}
      roadmap={roadmap}
      summaryPrefix={intro.summaryPrefix}
      summarySuffix={intro.summarySuffix}
    />
  </main>
)
