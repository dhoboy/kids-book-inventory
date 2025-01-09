const dropdownTypes = ["language", "author", "type"];

const initialState = {
  title: "",
  language: "",
  author: "",
  type: "",
};

let state = JSON.parse(JSON.stringify(initialState));

d3.csv("./book_data.csv").then((data) => {
  /*** draw function after state updates ***/
  const draw = (_callsite) => {
    // callsite for debugging purposes
    d3.select("#books-container").html("");

    const tableHeaders = Object.keys(data?.[0]);

    const filteredDataset = data.filter((d) => {
      let c1 = true;
      let c2 = true;
      let c3 = true;
      let c4 = true;

      const { title, language, author, type } = state;

      if (title.length) {
        const regex = new RegExp(title, "i");
        c1 = regex.test(d.title);
      }
      if (language.length && language !== "--") {
        c2 = d.language === language;
      }
      if (author.length && author !== "--") {
        c3 = d.author === author;
      }
      if (type.length && type !== "--") {
        c4 = d.type === type;
      }
      return c1 && c2 && c3 && c4;
    });

    if (filteredDataset.length) {
      const drawTable = d3.select("#books-container").append("table");

      const headerRow = drawTable.append("thead").append("tr");

      headerRow
        .selectAll("th")
        .data(tableHeaders)
        .enter()
        .append("th")
        .text((d) => {
          if (d === "publication_year") return "year";
          return d.replace(/_/g, " ");
        });

      const tableBody = drawTable.append("tbody");

      const tableRows = tableBody
        .selectAll("tr")
        .data(filteredDataset)
        .enter()
        .append("tr");

      // good job old me: https://blocks.roadtolarissa.com/dhoboy/1ac430a7ca883e7a8c09
      tableRows
        .selectAll("td")
        .data((d) => {
          let arr = [];
          for (var k in d) {
            if (d.hasOwnProperty(k)) {
              arr.push(d[k]);
            }
          }
          return arr;
        })
        .enter()
        .append("td")
        .text((d) => {
          return d.replace(/_/g, " ");
        });
    } else {
      d3.select("#books-container")
        .append("div")
        .attr("id", "no-books-found-message")
        .text(
          `No books found with these criteria. ` +
            `Click 'All' in the top right corner to clear filters and see all books.`,
        );
    }
  };

  /*** title input ***/
  addEventListener("input", (e) => {
    if (e.target.id === "title") {
      state.title = e.target.value;
      draw("titleinput");
    }
  });

  /*** dropdowns ***/

  // filter options builder fn
  const buildOptionsList = ({ key }) => {
    const opts = data.reduce((acc, next) => {
      const a = next[key];
      if (!acc[a]) acc[a] = next[a];
      return acc;
    }, {});

    return ["--"].concat(Object.keys(opts));
  };

  // e.g.: { language: [ "japanese", "english", ... ], author: [...], ... }
  const dropdownOptions = dropdownTypes.reduce((acc, next) => {
    acc[next] = buildOptionsList({ key: next });
    return acc;
  }, {});

  // draw the dropdowns to the page
  const dropdowns = d3
    .select("#filters-container")
    .selectAll(".filter")
    .data(dropdownTypes)
    .enter()
    .append("label")
    .attr("class", "filter");

  dropdowns.append("span").text((d) => d);

  const dropdownSelects = dropdowns.append("select");

  dropdownSelects.on("change", (e, d) => {
    const key = d;
    const { value } = e.target;
    state[key] = value;
    draw("dropdown: ", key);
  });

  dropdownSelects
    .selectAll("option")
    .data((d) => dropdownOptions[d])
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d);

  /*** clear all button ***/
  d3.select("h1")
    .append("button")
    .text("All")
    .on("click", () => {
      state = JSON.parse(JSON.stringify(initialState));
      dropdownSelects.property("value", "--");
      d3.select("#title").property("value", "");
      draw("see all button");
    });

  /*** inital page draw ***/
  draw("initial page draw");
});
