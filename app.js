
localStorage.setItem("selectOptions", '');
localStorage.setItem("controlSelect", '0');

function setSelect(tipo){
  localStorage.setItem("selectOptions", $('#select').val());
  showTreemap(tipo);
}
    
function showTreemap(tipo){
var loop = [];
let data22 = [];
// let data223 = [];
let dataTeste = '{ "name": "ASSETS", "children": [';

fetch(
  "https://sheetest.herokuapp.com/api?id=1eXuH6zQzJvWOs5G5ZMk9cZMWI1iqL32VTvcTTuWpLpA&sheet=1",
  { method: "GET" }
)
  .then(function (response) {
    response.json().then(function (res) {
      var ids = res.rows;

      ids.forEach((id, index) => {
        if(id.type == tipo){
          if(localStorage.getItem("controlSelect") == 0){
              if(id.name == 0){
                  var option = id.asset;
              }else{
                  var option = id.name;
              }
              if(localStorage.getItem("selectOptions").includes(id.asset)){
                  $("#select").append('<option value="'+id.asset+'" selected>'+option+'</option>');
              }else{
                  $("#select").append('<option value="'+id.asset+'">'+option+'</option>');
              }
          }

          if(localStorage.getItem("selectOptions").includes(id.asset) || localStorage.getItem("selectOptions") == ''){
            
            let data223 = [];
            if (!loop.includes(id.sector)) {
              loop.push(id.sector);
            }

            data223.push({
              idsector: id.idsector,
              sector: id.sector,
              name: id.asset,
              price: id.price,
              pc: id.variation,
              volume: id.volume,
            });
            data22.push(data223);
          }
        }
      });

      localStorage.setItem("controlSelect", '1');
      
      for (var y = 0; y < loop.length; y++) {
        var teste111 = 0;
        for (var x = 0; x < data22.length; x++) {
          var z = parseInt(x) + parseInt(1);
          if (loop[y] == data22[x][0].sector) {
            if (teste111 == 0) {
              dataTeste +=
                '{"name": "' +
                loop[y] +
                '", "children" :[{"name" :"' +
                data22[x][0].name +
                '","price" :"' +
                data22[x][0].price
                  .replace(/\./g, "")
                  .replace(/\,/g, ".")
                  .replace(/[^0-9\.]+/g, "") +
                '","pc" :"' +
                data22[x][0].pc.replace(/\./g, "").replace(/\,/g, ".") +
                '", "volume": ' +
                data22[x][0].volume +
                ', "idsector": ' +
                data22[x][0].idsector +
                '}';
            } else {
              dataTeste +=
                ', {"name" :"' +
                data22[x][0].name +
                '","price" :"' +
                data22[x][0].price
                  .replace(/\./g, "")
                  .replace(/\,/g, ".")
                  .replace(/[^0-9\.]+/g, "") +
                '","pc" :"' +
                data22[x][0].pc.replace(/\./g, "").replace(/\,/g, ".") +
                '", "volume": ' +
                data22[x][0].volume +
                ', "idsector": ' +
                data22[x][0].idsector +
                '}';
            }
            if (data22[z] != undefined) {
              if (loop[y] != data22[z][0].sector) {
                dataTeste += "]}, ";
              }
            } else {
              dataTeste += "]}";
            }
            teste111++;
          }
        }
      }
      dataTeste += "]}";

      let data = JSON.parse(dataTeste);

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
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 1);

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
            .on("click", function (d) {
              // console.log(d)
              tooltip.style("opacity", 1);
              $('#tooltip').html(`<div class="tooltip-body" style="color: #fff" data-id=${d.data.name} >
                <ul>
                  <li>Share: ${d.data.name}</li>
                  <li>price: ${d.data.price}</li>
                  <li>Change: ${d.data.pc}</li>
                  <li># todo line chart</li>
                </ul>
                
            </div>`);
            })
            .on("dblclick", function (d) {
              $('#tooltip').html('');
              addFav(d.data.name, d.data.idsector)
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
            .attr("font-size", (d) => Math.min(d.x1 - d.x0, d.y1 - d.y0) / 6);

          // Add a <tspan class="title"> for every data element.
          txt
            .append("tspan")
            .html((d) => d.data.name)
            .attr("class", "title")
            .attr("dy", "-1.5em")
            .attr("x", function () {
              const parentData = d3.select(this.parentNode).datum();
              return (parentData.x1 - parentData.x0) / 2;
            });

          // Add a <tspan class="author"> for every data element.

          txt
            .append("tspan")
            .text((d) => 'R$ '+(d.data.price).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1."))
            .attr("class", "price")
            .attr("dy", "1.4em")
            .attr("x", function () {
              const parentData = d3.select(this.parentNode).datum();
              return (parentData.x1 - parentData.x0) / 2;
            });

          // Add a <tspan class="author"> for every data element.
          txt
            .append("tspan")
            .text((d) => (d.data.pc > 0 ? `+${(d.data.pc*100).toFixed(2).replace('.', ',')}%` : `${(d.data.pc*100).toFixed(2).replace('.', ',')}%`))
            .attr("class", "percent")
            .attr("dy", "1.4em")
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
            // .attr("font-size", d => Math.max(d.x1 - d.x0, d.y1 - d.y0) / 22)
            .attr("font-size", "16px")
            .attr("font-weight", "400")
            .attr("fill", "#fff");

          return svg.node();
        };

        let filteredData = d3
          .hierarchy(data)
          .sum((d) => d.volume)
          .sort((a, b) => b.height - a.height || b.value - a.value);

        let reg = d3.selectAll("input[name='dtype']").on("change", function () {
          let dtype = this.value;
        });

        let treemap = d3
          .treemap()
          .size([width, height])
          .padding(1)
          .paddingRight(3)
          .paddingTop(25)
          .round(true);

        // let charsts = d3.select("#chart");

        let format = d3.format(",d");

        chart();
      }

      redraw();

      window.addEventListener("resize", redraw);

      $('.loading').remove();
      $('#menunav').show();
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
  }else{
    favoritos_ativo = favoritos_ativo.filter(item => item !== ativo)
    localStorage.setItem("favoritos_ativo" , favoritos_ativo);
  }
}
