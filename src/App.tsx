import { useStore } from './store';
import './App.css'
import { Timeline } from './components/timeline/Timeline'
import { useValidation } from './hooks/useValidation';
import { ErrorPanel } from './components/error/ErrorPanel';

function App() {
  const addLane = useStore((s: { addLane: any; }) => s.addLane);
  const { issues } = useValidation();

  return (
    <>
      <nav className="panel m-1 flex flex-row h-fit p-2 bg-amber-300">
        <h1 className="heading p-0 my-auto">Story weaver</h1>

        <div className="mx-auto">
            <div className="flex flex-row">
                <button className="btn">Timeline</button>
                <button className="btn">Column view</button>
                <button className="btn">Character builder</button>
                <button className="btn">Statistics</button>
            </div>
        </div>

      </nav>
        <div className="panel flex flex-row m-1">
          {/* Menu bar Right below navbar */}
          <button className="btn" onClick={addLane}>+ Lane</button>
        </div>
      <div className="flex flex-row timeline">
        <Timeline/>
      </div>
      
      <ErrorPanel issues={issues} />
    </>
  )
}

export default App
