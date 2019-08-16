/**Search and Open Reports
 * Este algoritmo serve para ler as informações de laudo direto do arquivo.csv
 * que gera eles e assim fornecer a funcionalidade de busca ao usuário.
 * Dessa forma o usuário pode buscar por um laudo de forma geral.
 */


// ==========================================
//============ Funções ======================
// ==========================================

let createReportRow = (codItem, description, reportsType) => {
    // repot row é a linha da tabela contendo as colunas determinadas
    // No caso: ícone + CodItem + Descrição
    let reportRow = `
    <tr class="report__row">
        <td class="report__icon">
            <a onclick="nw.Window.open('../../../../../assets/reports/${reportsType}/${codItem}.pdf', {width: 1366, height: 768});">
                <i class="flaticon-pdf"></i>
            </a>
        </td>
        <td class="report__number">
            <p class="code__number">
                <a onclick="nw.Window.open('../../../../../assets/reports/${reportsType}/${codItem}.pdf', {width: 1366, height: 768});">${codItem}</a>
            </p>
        </td>
        <td class="report__description">
            <p class="description__text">${description}</p>
        </td>
    </tr>
`
    return reportRow
}

let emptyBody = () => {
    $('.report__body').empty()
}

let filterLines = (activeFilters, dataArr) => {
    /**Filtra os valores baseado na lista activeFilters
     *  para cada linha, verifica se os filtros atualmente ativos
     *  invalidam ou não a linha
     *  e adiciona as linhas válidas ao filteredReportsList
     */
   
    let filteredReportsList = []    
    if (Object.keys(activeFilters).length > 0) {
        let match 
        dataArr.forEach((line) => {
            console.log(line); // debug
            match = true
            Object.keys(activeFilters).forEach((key) => {
                if (key === "2") {
                    // console.log(lowerCaseDescription); // debug
                    let lowerCaseDescription = line[key].toLowerCase()
                    let lowerCaseFilter = activeFilters[key].toLowerCase()
                    if(!lowerCaseDescription.includes(lowerCaseFilter)) {
                        match = false
                    }
                } else if ((line[key] !== activeFilters[key])) {
                    match = false
                }
            })
            if (match) {filteredReportsList.push(line)}
        })

        // se não achar nada na pesquisa
        if (filteredReportsList.length === 0) {
            $('.report__body').append(
                `<div class="alert alert-info" role="alert">Não foram encontrados resultados correspondentes.</div>`
            )
        }
    } else {
        // se não houver campos de pesquisa para filtrar
        alert("É necessário preencher algum campo de pesquisa.")
    }
    return filteredReportsList
}

let showFilteredLines = (filteredReportsList, reportsType) => {
    filteredReportsList.forEach((report) => {
        let reportRow = createReportRow(report[1], report[2], reportsType)
        $('.report__body').append(reportRow)
    })
}

let createActiveFilters = () => {

    let activeFilters = {} // filtros ativos

    // A classe inputField pertence somente aos formulários de filtragem
    $('.inputField').each(function(i){
        // pega cada input e adiciona o seu filtro, caso seja preenchido,
        // à lista de filtros ativos (activeFilters)
        if ($(this).attr("id") === "inputReportNumber" && $(this).val() !== "") {
            activeFilters["5"] = $(this).val()  

        } else if ($(this).attr("id") === "inputItemCode" && $(this).val() !== "") {
            activeFilters["1"] = $(this).val()

        } else if ($(this).attr("id") === "inputDescription" && $(this).val() !== "") {
            activeFilters["2"] = $(this).val()
        } 

        // adicionar mais condições, conforme novas colunas forem adicionadas
    })

    return activeFilters
}

let cleanFilters = () => {
    // limpa os campos de formulário preenchidos
    $('.inputField').each(function(i){
        $(this).val("")
    })
}

let createCsvOptions = (csvFilesNames) => {
    $('#inputCsvFileName').append(`<option selected="selected">-</option>`)
    csvFilesNames.forEach((name) => {
        $('#inputCsvFileName').append(`<option>${name}</option>`)
    })
}

let zebraRows = () => {
    let oddRows = $('.report__row') // tr.report__row
    oddRows.each(function(i) {
        // console.log(i % 2 === 0) // debug
        if (i % 2 === 0) {
            $( this ).removeClass('odd');
            $( this ).addClass('odd');
        } else {
            $( this ).removeClass('odd');
        }

    });
};

// ==========================================
// ============ Main ============
// ==========================================

const fs = require('fs-extra');

// lê quais arquivos csv há em /csv/
const csvFiles = fs.readdirSync("./assets/csv/")

// inseri eles como opções de seleção no formulário de csv
createCsvOptions(csvFiles)


/**
 * Mais informações podem ser adicionadas, basta adicionar colunas.
 * Porém será necessário alterar o algoritmo para lidar com as novas colunas
 * (ver apresentação_ambev para exemplo)
 */
// 0        1         2             3         4          ...
// FASE	;CODITEM;	DESCRIÇÃO;	FLUXOGRAMA;	CATEGORIA; ...
// Caixa 1;	689853;	Sed aliquam ultrices mauris.;	fluxograma1	alguma empresa;   ...

// ==========================================
// =========== Eventos ======================
// ==========================================

let reportsType // temporario, fazer direito depois
// evento para captar a opção de arquivo escolhida pelo usuário
let dataArr = [] // armazena uma lista de listas com os campos do csv
$('#inputCsvFileName').change({dataArr}, (e) => {

    // pega o nome do arquivo selecionado
    let fileName = $( "select#inputCsvFileName option:selected" ).text()

    // pega o tipo de laudo
    reportsType = fileName.split('_')[1]
    console.log(reportsType) // debug

    // validação do nome do arquivo
    if (fileName.includes(".csv")) {
        // ler o csv correspondente e salvar numa grande lista (para evitar reler toda vez que pesquisar)
        let rawData = fs.readFileSync(`./assets/csv/${fileName}`).toString()
        let lines = rawData.split("\n") // separa as linhas
    
        // remove a linha em branco
        if (lines[lines.length - 1]  === "") {
            lines = lines.slice(0, lines.length - 2)
        }
    
        lines.forEach((line) => {
            dataArr.push(line.split("|"))
    
        })

        // libera a utilização dos formulários de pesquisa
        console.log($('fieldset'));
        $('fieldset').prop('disabled', false)

    } else {

        // Caso o usuário escolha a opção nula novamente, restringi a utilização
        // dos formulários de pesquisa
        $('fieldset').prop('disabled', true)
    }


})
    
// cria um listener para o botão pesquisar
$("#submitBtn").click({dataArr}, function(event){

    // apaga as linhas geradas pela última pesquisa feita
    emptyBody()

    // TODO validar a existência de campos obrigatórios

    // pega os valores preenchidos e adiciona ao activeFilters
    let activeFilters = createActiveFilters()

    // filtra as linhas
    let filteredReportsList = filterLines(activeFilters, dataArr)
    
    // escreve no html os campos que corresponderam
    showFilteredLines(filteredReportsList, reportsType)

    // aplica linhas estilo zebra
    zebraRows()
    
});

// listener do botão "limpar pesquisa"
$("#cleanSearch").click(function(event){
        
    // remove valores dos formulários
    cleanFilters()

    // remove laudos escritos no html
    emptyBody()

})

