
localStorage.setItem("selectOptions", '');
localStorage.setItem("controlSelect", '0');

if(localStorage.getItem("favoritos_ativo") === null){
  localStorage.setItem("favoritos_ativo", "0");
}

function setSelect(tipo){
  localStorage.setItem("selectOptions", $('#select').val());
  showTreemap(tipo);
}

function showTreemap(tipo){
  var loop = [];
  let arrayMain = [];
  var selects = [];
  let dadosJson = '{ "name": "ASSETS", "children": [';

  var favoritos_ativo = localStorage.getItem("favoritos_ativo").split(',');

  fetch(
      "https://sheetest.herokuapp.com/api?id=1eXuH6zQzJvWOs5G5ZMk9cZMWI1iqL32VTvcTTuWpLpA&sheet=1",
      { method: "GET" }
  )
      .then(function (response) {
        response.json().then(function (res) {
          var ids = res.rows;

          ids.forEach((id, index) => {
            if(id.type == tipo || (tipo == 'favoritos' && favoritos_ativo.includes(id.asset))){
              if(id.name == 0){
                var option = id.asset;
              }else{
                var option = id.name;
              }
              selects.push(option);
              if(localStorage.getItem("selectOptions").includes(id.asset) || localStorage.getItem("selectOptions") == ''){

                let arrayDados = [];
                if (!loop.includes(id.sector)) {
                  loop.push(id.sector);
                }

                let volume = id.volume;

                if(tipo == 'favoritos' && favoritos_ativo.includes(id.asset)){
                  volume = 99999999;
                }

                arrayDados.push({
                  idsector: id.idsector,
                  sector: id.sector,
                  name: id.asset,
                  price: id.price,
                  pc: id.variation,
                  volume: volume,
                  type: id.type,
                  name_asset: id.name,
                });
                arrayMain.push(arrayDados);
              }
            }
          });

          for (var y = 0; y < loop.length; y++) {
            var contador = 0;
            for (var x = 0; x < arrayMain.length; x++) {
              var z = parseInt(x) + parseInt(1);
              if (loop[y] == arrayMain[x][0].sector) {
                if (contador == 0) {
                  dadosJson +=
                      '{"name": "' +
                      loop[y] +
                      '", "children" :[{"name" :"' +
                      arrayMain[x][0].name +
                      '","price" :"' +
                      arrayMain[x][0].price
                          .replace(/\./g, "")
                          .replace(/\,/g, ".")
                          .replace(/[^0-9\.]+/g, "") +
                      '","pc" :"' +
                      arrayMain[x][0].pc.replace(/\./g, "").replace(/\,/g, ".") +
                      '", "volume": ' +
                      arrayMain[x][0].volume +
                      ', "idsector": ' +
                      arrayMain[x][0].idsector +
                      ', "type": "' +
                      arrayMain[x][0].type +
                      '", "name_asset": "' +
                      arrayMain[x][0].name_asset +
                      '"}';
                } else {
                  dadosJson +=
                      ', {"name" :"' +
                      arrayMain[x][0].name +
                      '","price" :"' +
                      arrayMain[x][0].price
                          .replace(/\./g, "")
                          .replace(/\,/g, ".")
                          .replace(/[^0-9\.]+/g, "") +
                      '","pc" :"' +
                      arrayMain[x][0].pc.replace(/\./g, "").replace(/\,/g, ".") +
                      '", "volume": ' +
                      arrayMain[x][0].volume +
                      ', "idsector": ' +
                      arrayMain[x][0].idsector +
                      ', "type": "' +
                      arrayMain[x][0].type +
                      '", "name_asset": "' +
                      arrayMain[x][0].name_asset +
                      '"}';
                }
                if (arrayMain[z] != undefined) {
                  if (loop[y] != arrayMain[z][0].sector) {
                    dadosJson += "]}, ";
                  }
                } else {
                  dadosJson += "]}";
                }
                contador++;
              }
            }
          }
          dadosJson += "]}";

          let data = JSON.parse(dadosJson);

          let chartDiv = document.getElementById("chart");
          let svg = d3.select(chartDiv).append("svg");

          let format = d3.format(",d");

          let colors = [
            "#AA2121",
            "#C84040",
            "#ED7171",
            "#7EC17E",
            "#518651",
            "#215E2C",
            "#878787",
          ];

          var tooltip = d3
              .select("#chart")
              .append("div");

          function redraw() {
            var width = chartDiv.clientWidth;
            var height = chartDiv.clientHeight;

            d3.select("svg").html("");

            let chart = () => {
              const root = treemap(filteredData);

              const svg = d3.select("svg");

              svg
                  .attr("width", '100%')
                  .attr("height", '100%')
                  .classed("svg-content-responsive", true);

              const leaf = svg
                  .selectAll("g")
                  .data(root.leaves())
                  .enter()
                  .append("g")
                  .attr("transform", d => `translate(${d.x0},${d.y0})`)
                  .on("dblclick", function (d) {
                    $('#modals').html(`
              <div class="modal fade show" id="modalDetalhes" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" style="display: block; padding-right: 15px;" aria-modal="true">
                  <div class="modal-backdrop fade show"></div>
                  <div class="modal-dialog" role="document">
                      <div class="modal-content">
                          <div class="modal-header">
                              <h5 class="modal-title" id="ModalLabel">${d.data.name}</h5>
                          </div>
                          <button type="button" class="btn btn-close btn-outline-secondary btn-rounded btn-icon" onclick="$('#modalDetalhes').remove()"></button>
                          <div class="modal-body">
                              <li>Setor: ${d.data.name}</li>
                              <li>Preço: ${d.data.price}</li>
                              <li>Variaçao: ${d.data.pc}</li>
                          </div>
                      </div>
                  </div>
              </div>`);
                  });

              leaf
                  .append("rect")
                  .attr("id", (d) => (d.leafUid = "#leaf").id)
                  .attr("fill", (d) => getColor(d.data.pc))
                  .attr("fill-opacity", 1.0)
                  .attr("width", (d) => d.x1 - d.x0)
                  .attr("height", (d) => d.y1 - d.y0)
                  .attr("class", (d) => "node level-" + d.depth);

              let txt = leaf
                  .append("text")
                  .attr("fill", "#fff")
                  .attr("text-anchor", "middle")
                  .attr("class", "shadow")
                  // .attr("dy", "1.7em")
                  .attr("y", function () {
                    const parentData = d3.select(this.parentNode).datum();
                    return (parentData.y1 - parentData.y0) / 2;
                  })
                  // .attr("x", "1.7em")
                  // .attr("unicode-bidi","isolate-override")
                  .attr("font-size", (d) => Math.min(d.x1 - d.x0, d.y1 - d.y0) / 7);

              // Add a <tspan class="title"> for every data element.
              txt
                  .append("tspan")
                  .html(function (d) {
                    if(d.data.name_asset != '0'){
                      return d.data.name_asset;
                    }else{
                      return d.data.name;
                    }
                  })
                  .attr("class", "title")
                  .attr("dy", "-1em")
                  .attr("stroke-width", "50%")
                  .attr("font-size", function (d) {
                    if(d.data.name_asset == 'DOW JONES'){
                      return Math.min(d.x1 - d.x0, d.y1 - d.y0) / 6;
                    }else{
                      return Math.min(d.x1 - d.x0, d.y1 - d.y0) / 5;
                    }
                  })
                  .attr("x", function () {
                    const parentData = d3.select(this.parentNode).datum();
                    return (parentData.x1 - parentData.x0) / 2;
                  });

              txt
                  .append("tspan")
                  .text(function (d) {
                    if(d.data.name.indexOf('/USD') !== -1){
                      return '$'+(d.data.price).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
                    }
                    if(d.data.idsector == '14'){
                      return (d.data.price).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
                    }else{
                      return 'R$ '+(d.data.price).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
                    }
                  })
                  .attr("class", "price")
                  .attr("dy", "1.8em")
                  .attr("x", function () {
                    const parentData = d3.select(this.parentNode).datum();
                    return (parentData.x1 - parentData.x0) / 2;
                  });

              // Add a <tspan class="author"> for every data element.
              // Add a <tspan class="author"> for every data element.
              txt
                  .append("tspan")
                  .text((d) => (d.data.pc > 0 ? `+${(d.data.pc*100).toFixed(2).replace('.', ',')}%` : `${(d.data.pc*100).toFixed(2).replace('.', ',')}%`))
                  .attr("class", "percent")
                  .attr("dy", "1.8em")
                  .attr("x", function () {
                    const parentData = d3.select(this.parentNode).datum();
                    return (parentData.x1 - parentData.x0) / 2;
                  });

              // Add title for the top level
              svg
                  .selectAll("titles")
                  .data(
                      root.descendants().filter(function (d) {
                        return d.depth == 1;
                      })
                  )
                  .enter()
                  .append("g")
                  .attr("x", (d) => d.x0)
                  .attr("y", (d) => d.y0)
                  .attr("dx", (d) => d.x0 + d.x1)
                  .attr("dy", (d) => d.y0 + d.y1)
                  .append("text")
                  .attr("x", (d) => d.x0 + 3)
                  .attr("y", (d) => d.y0 + 18)
                  .text((d) => d.data.name)
                  // .attr("font-size", d => Math.max(d.x1 - d.x0, d.y1 - d.y0) / 35)
                  .attr("font-size", function (d) {
                    if(Math.max(d.x1 - d.x0, d.y1 - d.y0) / 22 > 16){
                      return 16;
                    }else if(Math.max(d.x1 - d.x0, d.y1 - d.y0) / 22 < 6){
                      return 8;
                    }else{
                      return Math.max(d.x1 - d.x0, d.y1 - d.y0) / 22;
                    }
                  })
                  .attr("font-weight", "bold")
                  .attr("fill", "#fff");

              return svg.node();
            };

            let filteredData = d3
                .hierarchy(data)
                .sum(function (d) {
                  if(d.type == 'outros'){
                    if(d.volume < 9999999){
                      return d.volume;
                    }else{
                      return d.volume;
                    }
                  }else if(d.type == 'fii'){
                    if(d.volume < 10000){
                      return 5000;
                    }else{
                      return d.volume;
                    }
                  }else{
                    if(d.volume < 34581){
                      return 80000;
                    }else{
                      return d.volume;
                    }
                  }
                })
                .sort((a, b) => b.height - a.height || b.value - a.value);

            let reg = d3.selectAll("input[name='dtype']").on("change", function () {
              let dtype = this.value;
            });

            let treemap = d3
                .treemap()
                .size([width, height])
                .padding(1)
                .paddingRight(1)
                .paddingTop(25)
                .round(true);

            // let charsts = d3.select("#chart");

            let format = d3.format(",d");

            if(tipo == sessionStorage.getItem("view")){
              chart();
              $('.loading').remove();
              $('#menunav').show();

              if(localStorage.getItem("controlSelect") == 0){
                for (var z = 0; z < selects.length; z++) {
                  console.log(selects[z])
                  if(localStorage.getItem("selectOptions").includes(selects[z])){
                    $("#select").append(`<option value="${selects[z]}" selected>${selects[z]}</option>`);
                  }else{
                    $("#select").append(`<option value="${selects[z]}">${selects[z]}</option>`);
                  }
                }
              }
              localStorage.setItem("controlSelect", '1');
            }
          }

          redraw();

          window.addEventListener("resize", redraw);
        });
      })
      .catch(function (err) {
        console.error(err);
      });
}
function getColor(variation) {
  variation = parseFloat(variation);

  if (variation >= 0.05) {
    return "#215E2D";
  } else if (variation > 0) {
    return "#518652";
  } else if (variation <= -0.05) {
    return "#AA2122";
  } else if (variation == 0) {
    return "#878787";
  } else {
    return "#C84041";
  }
}

if(localStorage.getItem("favoritos_ativo") === null){
  localStorage.setItem("favoritos_ativo", "0");
}

var favoritos_ativo = localStorage.getItem("favoritos_ativo").split(',');

function max(id){
  document.getElementById("icon"+id).innerHTML = "<i onclick='min("+id+")' class='fas fa-minus icon'></i>";

  document.getElementById("setorAtivos"+id).style.display = "flex";

  localStorage.setItem("setorAtivos"+id , "style='display: flex'");
  localStorage.setItem("icon"+id, "<i onclick='min("+id+")' class='fas fa-minus icon'></i>");
}
function min(id){
  document.getElementById("icon"+id).innerHTML = "<i onclick='max("+id+")' class='fas fa-plus icon'></i>";

  document.getElementById("setorAtivos"+id).style.display = "none";

  localStorage.setItem("setorAtivos"+id , "style='display: none'");
  localStorage.setItem("icon"+id, "<i onclick='max("+id+")' class='fas fa-plus icon'></i>");
}

function addFav(ativo){
  if(!favoritos_ativo.includes(ativo)){
    favoritos_ativo.push(ativo);
    localStorage.setItem("favoritos_ativo" , favoritos_ativo);

    notif({
      msg: "Adicionado aos favoritos!",
      type: "success",
      bgcolor: "#00B55E",
      color: "#FFF"
    });
  }else{
    favoritos_ativo = favoritos_ativo.filter(item => item !== ativo)
    localStorage.setItem("favoritos_ativo" , favoritos_ativo);

    notif({
      msg: "Removido dos favoritos!",
      type: "error",
      bgcolor: "#FF5A5A",
      color: "#FFF"
    });
  }
}
