export type Part =
  | { type: "text"; value: string }
  | { type: "input"; value: string; index: number };

const regex = () => /(\{\{[^{}]+}})/gi;

export const extract = (v: string): Part[] => {
  let index = 0;
  console.log(v.split(regex()))
  return v.split(regex()).map(
    (piece): Part => {
      const match = /\{\{([^{}]+)}}/.exec(piece);
      if (match) {
        const inside = match[1];
        const splitCloze = inside.split("::");
        return {
          type: "input",
          value: splitCloze.length > 1 ? splitCloze[1] : inside,
          index: index++,
        };
      }

      return {
        type: "text",
        value: piece,
      };
    },
  );
};
