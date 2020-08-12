import { FunctionalComponent, render } from "preact";
import React from "preact/compat";
import { useEffect, useState } from "preact/hooks";

type Answer = Record<number, string | null | undefined>;

declare function pycmd(cmd: string): void;

declare global {
  interface Window {
    answer: Answer;
  }
}

function showAnswer() {
  pycmd("ans");
}

interface FrontProps {
  parts: Part[];
  setGlobalAnswer: (answer: Answer) => void;
}

interface BackProps {
  parts: Part[];
  answer: Answer;
}

type Part =
  | { type: "text"; value: string }
  | { type: "input"; value: string; index: number };

const preprocess = (v: string): string => {
  return v.replace(/(<\w+>|<\/\w+>|)/gi, "");
};

export const process = (v: string): Part[] => {
  const regex = () => /(\s{|}\s)/gi;
  let index = 0;
  return (" " + preprocess(v) + " ")
    .split(regex())
    .filter(s => !regex().test(s))
    .map(
      (s): Part => {
        const m = /^{(.+)}$/.exec(s);
        if (m) {
          const splitted = m[1].split("::");
          return {
            type: "input",
            value: splitted.length == 2 ? splitted[1] : m[1],
            index: index++,
          };
        }
        return { type: "text", value: " " + s + " " };
      },
    );
};

const backgroundColor = (input: string | undefined, answer: string): string => {
  if (!input || input.trim() === "") return "";
  if (answer.trim() === input.trim()) {
    return "correct";
  } else if (answer.trim().indexOf(input.trim()) === 0) {
    return "partialCorrect";
  }

  return "wrong";
};

export const Front: FunctionalComponent<FrontProps> = ({
  parts,
  setGlobalAnswer,
}) => {
  useEffect(() => {
    setGlobalAnswer({});
  }, []);
  const [answer, setAnswer] = useState<Answer>({});
  const onChange = (v: Answer) => {
    setGlobalAnswer(v);
    setAnswer(v);
  };

  return (
    <p className="sentence">
      {parts.map(p => {
        if (p.type === "text") {
          return <span>{p.value}</span>;
        } else {
          const style = {
            width: `${50 + p.value.length * 16}px`,
          };
          return (
            <input
              id={"input" + p.index}
              autofocus={p.index === 0}
              className={
                "input " + backgroundColor(answer[p.index] || "", p.value)
              }
              onKeyUp={e => {
                if (e.key === "Enter") {
                  showAnswer();
                }
              }}
              value={answer[p.index] || ""}
              onChange={e => {
                onChange({
                  ...answer,
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

export const Back: FunctionalComponent<BackProps> = ({ parts, answer }) => {
  return (
    <p className="sentence">
      {parts.map(p => {
        if (p.type === "text") {
          return <span>{p.value}</span>;
        } else {
          const res = answer[p.index] || "";
          if (res === "") {
            return (
              <span className="answerIndicator">
                <span className="wrong">{p.value} </span>
              </span>
            );
          } else if (res.trim() === p.value.trim()) {
            return (
              <span className="answerIndicator">
                <span class="correct">{p.value}</span>
              </span>
            );
          } else {
            return (
              <span className="answerIndicator">
                <span className="wrong">{res} </span>
                <span className="correct">{p.value}</span>
              </span>
            );
          }
        }
      })}
    </p>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const content = rootElement.getAttribute("query") || "";
  const side = rootElement.getAttribute("side") || "front";
  rootElement.innerHTML = `
<style>
    .sentence {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-end;
        justify-content: center;
        margin-top: 25%;
        font-family: Inter,serif;
        font-size: 20px;
        line-height: 1.5;
    }
    .input {
        border-radius: 4px;
        border: solid 1px;
        font-family: Inter,serif;
        font-size: 20px;
        padding: 5px;
        margin: 0 5px;

    }
    .correct {
        background-color: rgb(177,236,157);
    }
    .partialCorrect {
        background-color: rgb(236,214,153);
    }
    .wrong {
        background-color: rgb(255,185,185);
    }
    
    .answerIndicator {
        display: inline-flex;
        flex-direction: column;
        margin: 0 5px;
    }
  
</style>
  `;

  if (side === "front") {
    render(
      <Front
        parts={process(content)}
        setGlobalAnswer={a => (window.answer = a)}
      />,
      rootElement,
    );

    setTimeout(() => {
      let firstInput = document.getElementById("input0");
      if (firstInput) {
        firstInput.focus();
      }
    }, 200);
  } else {
    render(
      <Back parts={process(content)} answer={window.answer || {}} />,
      rootElement,
    );
  }
}
