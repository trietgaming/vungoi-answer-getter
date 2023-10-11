const injectedCss = document.createElement("style");
injectedCss.textContent = `
  .vungoianswergetter {
    background-color: #ecf0f1!important;
    outline: 1px solid #3498db;
  }
`;
document.documentElement.appendChild(injectedCss);

const header = "<p><b>Free solution from vungoi-answer-getter:</b></p>";
console.log("INJECTED");
const { fetch: origFetch } = window;
window.fetch = async function (url, ...args) {
  const response = await origFetch(url, ...args);
  if (url.includes("getQuiz")) {
    console.log("New Question detected.");
    const data = await response.json();
    const explainationHtmls = data.quiz.solution_detail.map(
      (obj) => obj.content
    );
    const solutionElements = document.getElementsByClassName("solution-item");
    const solutionElement = solutionElements[solutionElements.length - 1];
    solutionElement.classList.add("vungoianswergetter");
    solutionElement.innerHTML = header + explainationHtmls.join("");
  }
  return response;
};
