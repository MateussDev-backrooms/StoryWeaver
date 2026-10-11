export function Narrative() {
    return <>
        <div className="frame mx-auto w-[90%] h-full overflow-y-auto">
            <div className="narrative-content w-full">
                <h1 className="heading-3 text-center">Narrative</h1>
                {/* TODO: Every beat goes here in chronological order */}
                <div className="panel flex flex-row items-baseline gap-2 my-1">
                    <span className="text-white p-1 shading mx-1" style={{ backgroundColor: "#c02020" }}>@Character1</span>
                    Dummy
                </div>

                <input className="input w-full h-15" type="text" placeholder="Add a new beat..." />
            </div>
        </div>
    </>;
}