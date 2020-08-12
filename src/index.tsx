import { FunctionalComponent, render } from "preact";
import React from "preact/compat";
import { useState } from "preact/hooks";

interface Props {
  parts: Part[];
}

type Part =
  | { type: "text"; value: string }
  | { type: "input"; value: string; index: number };

export const process = (v: string): Part[] => {
  const regex = () => /( {|} )/;
  return (" " + v + " ")
    .split(regex())
    .filter(s => !regex().test(s))
    .map(
      (s, index): Part => {
        const m = /^{(.+)}$/.exec(s);
        if (m) {
          const splitted = m[1].split("::");
          return {
            type: "input",
            value: splitted.length == 2 ? splitted[1] : m[1],
            index,
          };
        }
        return { type: "text", value: " " + s + " " };
      },
    );
};

type Style = Partial<Record<keyof CSSStyleDeclaration, string>>;

export const App: FunctionalComponent<Props> = ({ parts }) => {
  const [inputVals, setInputVals] = useState<Record<number, string>>({});
  return (
    <p>
      {parts.map(p => {
        if (p.type === "text") {
          return p.value;
        } else {
          const style: Style = {
            backgroundColor: inputVals[p.index] === p.value ? "green" : "white",
            height: "100px"
          };
          return (
            <input
              value={inputVals[p.index]}
              onChange={e => {
                setInputVals({
                  ...inputVals,
                  [p.index]: e.currentTarget.value,
                });
              }}
              style={style}
              type="text"
            />
          );
        }
      })}
    </p>
  );
};

const rootElement = document.getElementById("root");
const content = rootElement.innerText;
rootElement.innerText = "";

render(<App parts={process(content)} />, rootElement);
