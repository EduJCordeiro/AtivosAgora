
localStorage.setItem("selectOptions", '');
localStorage.setItem("controlSelect", '0');

if(localStorage.getItem("favoritos_ativo") === null){
  localStorage.setItem("favoritos_ativo", "0");
}

function setSelect(tipo){
  localStorage.setItem("selectOptions", $('#select').val());
  showTreemap(tipo);
}

function showTreemap(tipo) {
  const db = firebase.firestore();
  db.collection('ativos-agora').get().then(snapshot => {
    snapshot.docs.forEach(doc => {
      const timestamp_now = new Date().getTime();
      const timestamp_db = doc.data().date_time.seconds;
      const diff = ((timestamp_db - timestamp_now/1000)/60)*-1;

      if(parseFloat(diff) > parseFloat(5.5)){
        fetch(
            "https://sheetest.herokuapp.com/api",
            { method: "GET" }
        ).then(function (response) {
              response.json().then(function (res) {
                const date_time = firebase.firestore.Timestamp.fromDate(new Date());

                if(JSON.stringify(res).indexOf("columns") > 0){
                  db.collection('ativos-agora').doc('sheets').update({json: res, date_time: date_time})
                      .then(() => {
                        // console.log('atualizado');
                      })
                      .catch((err) => {
                        console.error(err);
                      });

                  showData(tipo, res);
                }else{
                  showData(tipo, doc.data().json);
                }
              });
            })
            .catch(function (err) {
              showData(tipo, doc.data().json);
              console.error(err);
            });
      }else{
        showData(tipo, doc.data().json);
      }
    })
  }).catch(err => {
    console.log(err.message)
  })
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

localStorage.setItem("selectOptions", '');
localStorage.setItem("controlSelect", '0');

function showData(tipo, res){
  
  var loop = [];
  let arrayMain = [];
  var selects = [];
  let dadosJson = '{ "name": "ASSETS", "children": [';

  var favoritos_ativo = localStorage.getItem("favoritos_ativo").split(',');

  var ids = res.rows;

  ids.forEach((id, index) => {
    if (id.type == tipo || (tipo == 'favoritos' && favoritos_ativo.includes(id.asset))) {
      if (id.name == 0) {
        var option = id.asset;
      } else {
        var option = id.name;
      }
      selects.push([option, id.asset]);
      if (localStorage.getItem("selectOptions").includes(id.asset) || localStorage.getItem("selectOptions") == '') {

        let arrayDados = [];
        if (!loop.includes(id.sector)) {
          loop.push(id.sector);
        }

        let volume = id.volume;

        if (tipo == 'favoritos' && favoritos_ativo.includes(id.asset)) {
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
          max: id.max,
          min: id.min,
          update: id.update,
          research: id.research,
          pvpa: id.pvpa,
          yield: id.yield,
          dividendo: id.dividendo,
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
              '", "max": "' +
              arrayMain[x][0].max +
              '", "min": "' +
              arrayMain[x][0].min +
              '", "update": "' +
              arrayMain[x][0].update +
              '", "research": "' +
              arrayMain[x][0].research +
              '", "sector": "' +
              arrayMain[x][0].sector +
              '", "pvpa": "' +
              arrayMain[x][0].pvpa +
              '", "yield": "' +
              arrayMain[x][0].yield +
              '", "dividendo": "' +
              arrayMain[x][0].dividendo +
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
              '", "max": "' +
              arrayMain[x][0].max +
              '", "min": "' +
              arrayMain[x][0].min +
              '", "update": "' +
              arrayMain[x][0].update +
              '", "research": "' +
              arrayMain[x][0].research +
              '", "sector": "' +
              arrayMain[x][0].sector +
              '", "pvpa": "' +
              arrayMain[x][0].pvpa +
              '", "yield": "' +
              arrayMain[x][0].yield +
              '", "dividendo": "' +
              arrayMain[x][0].dividendo +
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
    var color = "";

    d3.select("svg").html("");

    let chart = () => {
      const root = treemap(filteredData);

      const svg = d3.select("svg");

      svg
          .attr("width", '100%')
          .attr("height", '100%')
          .attr("style", 'margin-top: -20px')
          .classed("svg-content-responsive", true);

          const leaf = svg
          .selectAll("g")
          .data(root.leaves())
          .enter()
          .append("g")
          .attr("transform", d => `translate(${d.x0},${d.y0})`)
          .text(function (d) {
            if(d.data.name.indexOf('/USD') !== -1){
              d.data.price2 = '$'+(d.data.price).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
            }else{
              d.data.price2 = 'R$ '+(d.data.price).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
            }

          })
          .text((d) => d.data.pc2 = (d.data.pc > 0 ? `+${(d.data.pc*100).toFixed(2).replace('.', ',')}%` : `${(d.data.pc*100).toFixed(2).replace('.', ',')}%`))
          .on("dblclick", function (d) {

            if(d.data.pc > 0){
              color = "dc_color_p";
            }else if(d.data.pc == 0){
              color = "dc_color_e";
            }else{
              color = "dc_color_m";
            }

            if(d.data.type == 'fii'){ // Modal de fundos imobiliarios
            $('#modals').html(`
              <div class="modal modal-details fade show" id="modalDetalhes" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" style="display: block; padding-right: 15px;" aria-modal="true">
                  <div class="modal-backdrop fade show"></div>
                  <div class="modal-dialog" role="document">
                      <div class="modal-content modal-content-w">
                          <div class="modal-header">
                            <div class="starFav">
                              <div id="fav" class="tooltip-right" tooltip-text="Adicionar aos favoritos"><i onclick="fav('${d.data.name}')" class="far fa-star"></i></div>
                              <div id="disfav" style='display:none' class="tooltip-right" tooltip-text="Remover dos favoritos"><i onclick="disfav('${d.data.name}')" class="fas fa-star"></i></div>
                            </div>
                              <h5 class="modal-title modal-details-title" id="ModalLabel">${d.data.name}</h5>
                          </div>
                          <button type="button" class="btn btn-close btn-outline-secondary btn-rounded btn-icon" onclick="closeModal('${tipo}')"></button>
                          <div class="modal-body modal-details-body">
                            <div class="details-content">
                              <h5 class="dc_name">${d.data.research}</h5>
                              <span class="dc_sector">${d.data.sector}</span>
                              <div class="dc_prices dc_bdr_top">
                                <div class="dc_box">
                                  <span class="dc_box_title">Mínima</span>
                                  <span class="dc_box_value">${d.data.min}</span>
                                </div>
                                <div class="dc_border"></div>
                                <div class="dc_box dc_padd">
                                  <span class="dc_box_title">Preço</span>
                                  <span class="dc_box_value dc_value_price">${d.data.price2}</span>
                                  <span class="dc_box_var ${color}">${d.data.pc2}</span>
                                </div>
                                <div class="dc_border"></div>
                                <div class="dc_box">
                                  <span class="dc_box_title">Máxima</span>
                                  <span class="dc_box_value">${d.data.max}</span>
                                </div>
                              </div>
                              <div class="dc_border_h"></div>
                              <div class="dc_prices dc_bdr_bottom">
                                <div class="dc_box">
                                  <span class="dc_box_title">V/VPA</span>
                                  <span class="dc_box_value">${d.data.pvpa}</span>
                                </div>
                                <div class="dc_border"></div>
                                <div class="dc_box">
                                  <span class="dc_box_title">Último rendimento</span>
                                  <span class="dc_box_value dc_value_price">${d.data.dividendo}</span>
                                </div>
                                <div class="dc_border"></div>
                                <div class="dc_box">
                                  <span class="dc_box_title">Yield/mês</span>
                                  <span class="dc_box_value">${d.data.yield}</span>
                                </div>
                              </div>
                            </div>
                              <li class='modal-att'>Atualizado em ${d.data.update}</li>
                          </div>
                      </div>
                  </div>
              </div>
              <script>
                function closeModal(tipo){
                  $('#modalDetalhes').remove();
                  if(tipo == "favoritos"){
                    showTreemap(tipo);
                  }
                }
              </script>
            `);
            }else{ // Modal de ações e cripto
              $('#modals').html(`
                <div class="modal modal-details fade show" id="modalDetalhes" tabindex="-1" role="dialog" aria-labelledby="ModalLabel" style="display: block; padding-right: 15px;" aria-modal="true">
                    <div class="modal-backdrop fade show"></div>
                    <div class="modal-dialog" role="document">
                        <div class="modal-content modal-content-w">
                            <div class="modal-header">
                              <div class="starFav">
                                <div id="fav" class="tooltip-right" tooltip-text="Adicionar aos favoritos"><i onclick="fav('${d.data.name}', ${tipo})" class="far fa-star"></i></div>
                                <div id="disfav" style='display:none' class="tooltip-right" tooltip-text="Remover dos favoritos"><i onclick="disfav('${d.data.name}', ${tipo})" class="fas fa-star"></i></div>
                              </div>
                                <h5 class="modal-title modal-details-title" id="ModalLabel">${d.data.name}</h5>
                            </div>
                            <button type="button" class="btn btn-close btn-outline-secondary btn-rounded btn-icon" onclick="closeModal('${tipo}')"></button>
                            <div class="modal-body modal-details-body">
                            <div class="details-content">
                              <h5 class="dc_name">${d.data.research}</h5>
                              <span class="dc_sector">${d.data.sector}</span>
                              <div class="dc_prices dc_bdr_top">
                                <div class="dc_box">
                                  <span class="dc_box_title">Mínima</span>
                                  <span class="dc_box_value">${d.data.min}</span>
                                </div>
                                <div class="dc_border"></div>
                                <div class="dc_box dc_padd">
                                  <span class="dc_box_title">Preço</span>
                                  <span class="dc_box_value dc_value_price">${d.data.price2}</span>
                                  <span class="dc_box_var ${color}">${d.data.pc2}</span>
                                </div>
                                <div class="dc_border"></div>
                                <div class="dc_box">
                                  <span class="dc_box_title">Máxima</span>
                                  <span class="dc_box_value">${d.data.max}</span>
                                </div>
                              </div>
                            </div>
                              <li class='modal-att'>Atualizado em ${d.data.update}</li>
                          </div>
                        </div>
                    </div>
                </div>
                <script>
                  function closeModal(tipo){
                    $('#modalDetalhes').remove();
                    if(tipo == "favoritos"){
                      showTreemap(tipo);
                    }
                  }
                </script>
              `);
            }

            var fav_ativo = localStorage.getItem("favoritos_ativo").split(',');

            if(fav_ativo.includes(d.data.name)){
              document.getElementById('fav').style.display = "none";
              document.getElementById('disfav').style.display = "block";
            }else{
              document.getElementById('fav').style.display = "block";
              document.getElementById('disfav').style.display = "none";
            }

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
            if (d.data.name_asset != '0') {
              return d.data.name_asset;
            } else {
              return d.data.name;
            }
          })
          .attr("class", "title")
          .attr("dy", "-1em")
          .attr("stroke-width", "50%")
          .attr("font-size", function (d) {
            if (d.data.name_asset == 'DOW JONES') {
              return Math.min(d.x1 - d.x0, d.y1 - d.y0) / 6;
            } else {
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
            if (d.data.name.indexOf('/USD') !== -1 || d.data.idsector == '26') {
              return '$' + (d.data.price).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
            }else if (d.data.idsector == '14') {
              return (d.data.price).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
            } else {
              return 'R$ ' + (d.data.price).replace('.', ',').replace(/(\d)(?=(\d{3})+\,)/g, "$1.");
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
          .text((d) => (d.data.pc > 0 ? `+${(d.data.pc * 100).toFixed(2).replace('.', ',')}%` : `${(d.data.pc * 100).toFixed(2).replace('.', ',')}%`))
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
          .attr("x", (d) => d.x0 + 4)
          .attr("y", (d) => d.y0 + 25)
          .text((d) => d.data.name)
          .attr("font-size", function (d) {
            if(Math.min(d.x1 - d.x0, d.y1 - d.y0)/20 > 15){
              return 14;
            }else if(Math.min(d.x1 - d.x0, d.y1 - d.y0)/20 < 6){
              return 8;
            }else{
              return Math.min(d.x1 - d.x0, d.y1 - d.y0)/18;
            }
          })
          .attr("fill", "#fff");

      return svg.node();
    };

    let filteredData = d3
        .hierarchy(data)
        .sum(function (d) {
          function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
          }

          if (d.type == 'outros') {
            if (d.volume < 9999999) {
              return d.volume;
            } else {
              return d.volume;
            }
          } else if (d.type == 'fii') {
            if (d.volume < 10000) {

              return getRandomArbitrary(40000, 75000);
            } else {
              return d.volume;
            }
          } else {
            if (d.idsector == 7) {
              return 8500000;
            }
            if (d.volume < 1000000) {
              return getRandomArbitrary(3000000, 6000000);
            } else if (d.volume > 1000000 && d.volume < 5000000) {
              return getRandomArbitrary(6000000, 1000000);
            } else {
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
        .paddingRight(3)
        .paddingLeft(3)
        .paddingBottom(0)
        .paddingTop(30)
        .round(true);

    // let charsts = d3.select("#chart");

    let format = d3.format(",d");

    if (tipo == sessionStorage.getItem("view")) {
      chart();
      $('.loading').remove();
      $('#menunav').show();
      $('#tips').show();

      if (localStorage.getItem("controlSelect") == 0) {
        for (var z = 0; z < selects.length; z++) {
          if (localStorage.getItem("selectOptions").includes(selects[z])) {
            $("#select").append(`<option value="${selects[z][1]}" selected>${selects[z][0]}</option>`);
          } else {
            $("#select").append(`<option value="${selects[z][1]}">${selects[z][0]}</option>`);
          }
        }
      }
      localStorage.setItem("controlSelect", '1');
    }
  }

  redraw();

  window.addEventListener("resize", redraw);
}

function fav(ativo){
  favoritos_ativo.push(ativo);
  localStorage.setItem("favoritos_ativo" , favoritos_ativo);

  document.getElementById('fav').style.display = "none";
  document.getElementById('disfav').style.display = "block";

  notif({
    msg: "Adicionado aos favoritos com sucesso!",
    type: "success",
    bgcolor: "#00B55E",
    color: "#FFF"
  });
}

function disfav(ativo){
  favoritos_ativo = favoritos_ativo.filter(item => item !== ativo)
  localStorage.setItem("favoritos_ativo" , favoritos_ativo);

  document.getElementById('fav').style.display = "block";
  document.getElementById('disfav').style.display = "none";

  notif({
    msg: "Removido dos favoritos com sucesso!",
    type: "success",
    bgcolor: "#00B55E",
    color: "#FFF"
  });
}

