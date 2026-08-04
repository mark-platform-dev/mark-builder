import { createRoot } from 'react-dom/client'
import hero from './data/hero.yaml'
import commands from './data/commands.yaml'
import layout from './data/layout.yaml'
import dataflow from './data/dataflow.yaml'
import steps from './data/steps.yaml'
import Hero from './components/Hero.jsx'
import Commands from './components/Commands.jsx'
import FolderTree from './components/FolderTree.jsx'
import DataFlow from './components/DataFlow.jsx'
import Steps from './components/Steps.jsx'

createRoot(document.getElementById('root')).render(
  <main className="mx-auto max-w-3xl bg-paper p-10 font-sans text-ink">
    <Hero d={hero} />
    <Commands d={commands} />
    <FolderTree d={layout} />
    <DataFlow d={dataflow} />
    <Steps d={steps} />
  </main>
)
