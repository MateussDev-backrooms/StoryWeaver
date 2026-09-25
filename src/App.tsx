import { useStore } from "./store/store";
import "./App.css";
import { Timeline } from "./components/timeline/Timeline";
import { useValidation } from "./hooks/useValidation";
import { ErrorPanel } from "./components/error/ErrorPanel";
import {
  RiArrowGoBackFill,
  RiArrowGoForwardFill,
  RiDeleteBack2Fill,
  RiPencilLine,
  RiPenNibFill,
  RiPieChart2Line,
  RiQuillPenFill,
  RiShape2Line,
  RiTimelineView,
} from "react-icons/ri";
import { Toolbar } from "./components/timeline/ToolBar";
import { ModalHost } from "./components/modals/ModalHost";

function App() {
  const { issues } = useValidation();

  return (
    <>
      <nav className="panel m-1 flex flex-row h-fit p-2 bg-amber-300">
        <h1 className="heading p-0 my-auto">Story weaver</h1>

        <div className="mx-auto">
          <div className="flex flex-row">
            <button className="btn btn-tab-selected flex flex-row items-center">
              {" "}
              <RiTimelineView className="m-1"></RiTimelineView> Timeline
            </button>
            <button className="btn flex flex-row items-center">
              {" "}
              <RiPencilLine className="m-1"></RiPencilLine> Narrative
            </button>
            <button className="btn flex flex-row items-center">
              {" "}
              <RiPieChart2Line className="m-1"></RiPieChart2Line> Statistics
            </button>
          </div>
        </div>
      </nav>

      <ModalHost/>

      <div className="panel panel-sm flex flex-row m-1">
        {/* Menu bar Right below navbar */}
        <div className="shading-inverted bg-slate-400 p-[0.2rem] flex flex-row text-xl">
          <button
            className={`btn btn-sm flex flex-row items-center gap-1`}
            title={`Undo`}
          >
            <RiArrowGoBackFill />
          </button>
          <button
            className={`btn btn-sm flex flex-row items-center gap-1`}
            title={`Redo`}
            disabled={true}
          >
            <RiArrowGoForwardFill />
          </button>
        </div>

        {/* Toolbar */}
        <div className="shading-inverted bg-slate-500 p-[0.2rem] flex flex-row text-xl">
          <Toolbar></Toolbar>
        </div>
      </div>
      <div className="timeline h-[80vh] shading-inverted p-0 m-1 bg-[#bbbbbb] overflow-y-auto">
        <Timeline />
      </div>
      <div className="panel flex flex-row m-1">{/* Footer */}</div>

      <ErrorPanel issues={issues} />
    </>
  );
}

export default App;
