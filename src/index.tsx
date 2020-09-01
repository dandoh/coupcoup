import { FunctionalComponent, render } from "preact";
import React from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { extract, Part } from "./extract";

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
          const lines = p.value.split("\n");
          return (
            <>
              {lines.map((content, id) => {
                if (id < lines.length - 1) {
                  return (<>
                    <span>{content}</span>
                    <span className="break"/>
                  </>);
                }

                return <span>{content}</span>;
              })}
            </>
          );
        } else {
          const style = {
            width: `${p.value.length * 14}px`,
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
          const lines = p.value.split("\n");
          return (
            <>
              {lines.map((content, id) => {
                if (id < lines.length - 1) {
                  return (<>
                    <span>{content}</span>
                    <span className="break"/>
                  </>);
                }

                return <span>{content}</span>;
              })}
            </>
          );
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
  const content = rootElement.innerText.trim();
  // const content = `hello {{world}}
  //  hello world
  //  mama
  //  hello {{world}}`;
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
        line-height: 2;
    }
    .input {
        border-radius: 4px;
        border: solid 1px;
        font-family: Inter,serif;
        font-size: 20px;
        padding: 5px;
        margin: 2px 5px;

    }
    .break {
        flex-basis: 100%;
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
        parts={extract(content)}
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
      <Back parts={extract(content)} answer={window.answer || {}}/>,
      rootElement,
    );
  }
}
