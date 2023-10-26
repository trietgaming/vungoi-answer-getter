const injectedCss = document.createElement("style");
injectedCss.textContent = `
  .vungoianswergetter {
    background-color: #ffffff!important;
    outline: 1px solid #3498db;
    border-radius: 8px;
  }
  .disable-events {
    pointer-events: auto!important;
    user-select: auto!important;
  }

  .enable-events {
    pointer-events: auto!important;
    user-select: auto!important;
  }

  .content-quiz {
    pointer-events: auto!important;
    user-select: auto!important;
  }

  .rich_text {
    user-select: auto!important;
  }
`;
document.documentElement.appendChild(injectedCss);

// Enable contextmenu
const listen = document.addEventListener;

function nonEmptyArray(...args) {
  for (const arg of args) {
    if (arg && arg.length > 0) return arg;
  }
  return [];
}

listen("keydown", function (e) {
  const answerOptions = nonEmptyArray(
    document.getElementsByClassName("option-answers"),
    document.getElementsByClassName("vn-box-answer")[0]?.children[0]?.children
  );

  let pick = null;
  if (e.key.toUpperCase() === "A" || e.key === "1") {
    pick = answerOptions[0];
  } else if (e.key.toUpperCase() === "B" || e.key === "2") {
    pick = answerOptions[1];
  } else if (e.key.toUpperCase() === "C" || e.key === "3") {
    pick = answerOptions[2];
  } else if (e.key.toUpperCase() === "D" || e.key === "4") {
    pick = answerOptions[3];
  } else if (e.key === "Enter" || e.key === "ArrowRight") {
    const next =
      document.getElementsByClassName("btn-green btn-action")[0] ||
      document.getElementsByClassName("bg-green")[0];
    next.click();
  } else if (e.key === "0") {
    const sol = document.getElementsByClassName("bg-grey btn-action")[0];
    if (document.getElementsByClassName("fa-angle-double-down").length === 0)
      sol?.click();
    setTimeout(() => sol?.scrollIntoView(), 100);
  } else if (e.key === "`" || e.key === ".") {
    document.getElementById("package")?.scrollIntoView();
  }
  pick?.click();
});

document.addEventListener = function (e, ...args) {
  if (e === "contextmenu" || e === "keyup" || e === "keydown") {
    return;
  }
  return listen.bind(document)(e, ...args);
};

function nodeWithClass(tag, classname, innerhtml) {
  const el = document.createElement(tag);
  el.className = classname;
  el.innerHTML = innerhtml;
  return el;
}

const header =
  "<p><b>(vungoi-answer-getter) Lời giải của GV Vungoi.vn:</b></p>";
const sugHeader = "<p><b>Gợi ý/Phương pháp giải:</b></p>";

let backupSol, backupSug, lastQuestionIdx;

console.log("INJECTED");
const { fetch: origFetch } = window;
window.fetch = async function (url, ...args) {
  const response = await origFetch(url, ...args);
  if (url.includes("getQuiz")) {
    console.log("New Question detected.");
    const data = await response.json();
    const explainationHtmls =
      data?.quiz?.solution_detail?.map((obj) => obj.content) ||
      (lastQuestionIdx != currentQuestionIdx && backupSol);
    const suggestionHtmls =
      data?.quiz?.solution_suggesstion?.map((obj) => obj.content) ||
      (lastQuestionIdx != currentQuestionIdx && backupSug);

    const currentQuestionIdx = data?.quiz?.idx || lastQuestionIdx;

    backupSol = explainationHtmls;
    backupSug = suggestionHtmls;
    lastQuestionIdx = currentQuestionIdx;
  } else if (url.includes("answer")) {
    setTimeout(() => {
      const solutionElements = document.getElementById("solution-undefined");
      // console.log(solutionElements);
      if (solutionElements) {
        console.log("Showing solution...");
        const solutionElement = nodeWithClass(
          "div",
          "solution-item vungoianswergetter",
          header + backupSol
        );
        const suggestionElement = nodeWithClass(
          "div",
          "solution-item vungoianswergetter",
          sugHeader + backupSug
        );
        solutionElements.textContent = "";
        solutionElements.appendChild(suggestionElement);
        solutionElements.appendChild(solutionElement);
      }
    }, 50);
  }
  return response;
};
