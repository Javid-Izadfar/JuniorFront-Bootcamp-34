import { SLICES_PER_PIZZA, pizzaCopy, sliceGeometry } from "../pizza.ts";

type PieProps = {
  openSlices: number;
};

function Pie({ openSlices }: PieProps) {
  return (
    <svg
      className="pie"
      viewBox="0 0 100 100"
      role="img"
      aria-label={`${openSlices} of ${SLICES_PER_PIZZA} slices on the current pie`}
    >
      <circle cx="50" cy="50" r="34" fill="#f7f5f1" />
      {Array.from({ length: openSlices }, (_, index) => {
        const { wedge, crust, dot } = sliceGeometry(index);

        return (
          <g
            key={index}
            className="pie-slice is-filled"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <path d={wedge} fill="#f6c453" />
            <path
              d={crust}
              fill="none"
              stroke="#c9843c"
              strokeWidth="7"
              strokeLinecap="butt"
            />
            <circle cx={dot.x.toFixed(2)} cy={dot.y.toFixed(2)} r="3.1" fill="#d4533c" />
          </g>
        );
      })}
    </svg>
  );
}

type PizzaProps = {
  slices: number;
};

export function Pizza({ slices }: PizzaProps) {
  const safeSlices = Number.isFinite(slices) && slices > 0 ? Math.floor(slices) : 0;
  const copy = pizzaCopy(safeSlices);

  return (
    <section className="pizza" aria-label="Pizza owed">
      <Pie openSlices={copy.open} />
      <div className="pizza-copy">
        <p className="pizza-owed">{copy.owed}</p>
        <p className="pizza-next">{copy.next}</p>
      </div>
    </section>
  );
}
