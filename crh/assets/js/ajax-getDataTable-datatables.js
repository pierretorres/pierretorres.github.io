/**
 * Gera tabelas por demanda através de requisição Ajax
 * 
*/
const swig = require('swig-templates');

// caminhos
const csvFilesDir = './assets/csv-datatables'

// funções
const dataToArray = (data) => {
    /**
     * Transforma os dados recebidos do csv em uma lista de listas
     * Exemplo de dados:
     *  0: (6) ["", "", "", "", "", ""]
     *  1: (6) ["923758,369999991", "5148552,89000019", "0", "42510945,7699998", "0", "48583257,03"]
     *  2: (6) ["0", "0", "0", "0", "0", "0"]
     * ...
    */

    let delimiter = "|"
    let array = data.split("\n") // cria uma lista com as linhas do arquivo csv
    let arrayOfLists = array.map(fields => fields.split(delimiter)) // separa cada linha em uma lista de campos

    return arrayOfLists
}

const formatThousands = (thousands) => {
    /**
     * Formata os milhares de uma string com número
     * 42510945 -> 42.510.945
     * código retirado de e alterado para o meu caso: 
     * https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
     */
    return thousands.replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

const formatNumber = (stringNumber) => {
    /**
     * Recebe uma string contendo um número
     * Pega este número e formata ele para melhorar a legibilidade
     * 224844,882040018 -> 224.844,88
     * 42510945,7699998 -> 42.510.945,77
    */
    
    // verifica se o conteúdo da string possui um número
    if ( isNaN(parseFloat(stringNumber)) ) { // retornar NaN se não for número
        return stringNumber
    }

    // aproxima o número para duas casas decimais   
    formatedNumber = parseFloat(stringNumber.replace(",", ".")).toFixed(2) // retorna uma string: 42510945,7699998 -> 42510945,77

    // formata os números de milhares
    let [thousands, decimals] = formatedNumber.split(".") // thousands, decimals = ["42510945", "77"]

    if (thousands.length > 3) {
        thousands =  formatThousands(thousands) // 42510945 -> 42.510.945
    }

    formatedNumber = thousands + ',' + decimals // "42.510.945" + "," + "77" = 42.510.945,77

    return formatedNumber
}

const fillTableConsolidada = (parsedData) => {
    /** 
     * @param parsedData recebe o arrayOfLists (parsedData significa "dados processados")
     * @description: 
     * Pega uma lista de linhas com campos e preenche uma tabela consolidada com estes campos
     * A tabela consolidada já possui header e a primeira coluna de dados, a função preenche o resto
     * da tabela.
    */

    // itera por todas as linhas pertencentes ao corpo tbody da tabela
    $('tbody tr').each(function (trIndex) { 
        // pega todos os <td>, com exceção do primeiro, do <tr> atualmente selecionado
        $(this).children('td ~ td').each(function(tdIndex){ 
            // o index do tr serve para pegar a linha correspondete e o index do td serve para pegar o campo correspondente
            let field = parsedData[trIndex][tdIndex] 

            // pega o td e adiciona um value=425879.78566 para cálculo e preenche o td com o valor formatado 425.879,79 para visualização
            $(this).attr('value', field.replace(",", ".")).text(formatNumber(field)) 
        })
          
    })

    // implementa a configuração do Datatables após a tabela ser preenchida
    $('#tabelaConsolidada').DataTable({
        ordering: false,
        paginate: false,
        fixedHeader: true
    })

    // remove o position: sticky da barra de navegação para que o header da tabela prevaleça
    $('.navigation').css("position", "static");
}

const fillTableDetalhada = (parsedData) => {
    /** 
     * @param parsedData recebe o arrayOfLists (parsedData significa "dados processados")
     * @description: 
     * Pega uma lista de linhas com campos e preenche uma tabela detalhada com estes campos
     * A tabela detalhada possui um <thead> e <tbody> vazios, que serão preenchidos com
     * os valores do parsedData
    */
    
    // carrega os dados na tabela
    parsedData.forEach((line, index) => {
        let $tr = $('<tr></tr>')

        if (index !== 0) {
            line.forEach((field, fieldIndex) => {
                let $td
                if (fieldIndex !== 1 && fieldIndex !== 3) { // para o caso de não ser coluna CPF e não ser coluna Nº da nota fiscal
                    $td = $('<td></td>').attr('value', field.replace(",", ".")).text(formatNumber(field))
                } else {
                    $td = $('<td></td>').text(field)
                }
                
                $tr.append($td)
            })
            $('tbody').append($tr)

        } else {
            // primeira linha é cabeçalho
            line.forEach(field => {
                let $th = $('<th></th>').text(field)
                $tr.append($th)
            })
            $('thead').append($tr)
        }
        
    })

    // implementa a configuração do Datatables
    let table = $('#tabelaDetalhada').DataTable({
        fixedHeader: true,
        "footerCallback": function(){
            /**
             * funcionalidade do DataTables que permite chamar um callback para o footer
             * toda vez que algum evento ocorre no dataTables
             * https://datatables.net/reference/option/footerCallback
             * https://datatables.net/examples/advanced_init/footer_callback.html
            */

            let api = this.api()
            let cellsSum = 0

            // soma os valores da página atual
            let $cells = api
                            .column(6, {page: 'current'})
                            .nodes()
                            .to$()
            // soma o valor total da coluna Valor
            $cells.each(function (){
                let value = $(this).attr('value')
                cellsSum += parseFloat(value)
            })
            cellsSum = formatNumber(cellsSum.toString()) // a função formatNumber funciona também para números com separador "."
            $('tfoot td:nth-child(7)').text(cellsSum) // seleciona o td que irá ter a soma dos valores
        }
    })

    // Aplica o search do datatables
    // https://datatables.net/reference/api/
    table.columns().every( function () { // cria um iterador com objetos tipo column()

        let column = this; // https://datatables.net/reference/api/column()

        // https://datatables.net/examples/api/multi_filter_select.html
        if (column.index() === 0) { // input tipo select
            let $selectInput = $(`select[name|=${column.index()}]`)
            
            $selectInput.change(function(){
                column
                    .search(this.value) // procura o texto caputrado na coluna corespondente
                    .draw() // redesenha a tabela
            })

            // adiciona as opções de seleção
            column.data().unique().sort().each( function ( d, j ) {
                $selectInput.append( `<option value="${d}">${d}</option>` )
            } );
        } else { // input text
            // adiciona um listener com 2 eventos à coluna correspondente baseado no index dela
            $(`input[name|=${column.index()}]`).on( 'keyup change', function () {
                column
                    .search(this.value) // procura o texto caputrado na coluna corespondente
                    .draw() // redesenha a tabela
            } );
        }
        
    } );

    // remove o position: sticky da barra de navegação
    $('.navigation').css("position", "static");
    
}

// --------- Main --------------
// pega o título da página (titulo da pagina = nome do arquivo csv a buscar)
let tableTitle = $('h1').text()

let fileName = tableTitle.replace(/\s/g, '_') + '.csv'

// busca o arquivo csv através de um $.get baseado no título da tabela
$.get(`../../../${csvFilesDir}/${fileName}`, (csvData) => {
    let arrayOfLists = dataToArray(csvData)
    // let $consolidadaRow = $('.consolidadaBody__row')
    // let $tbody = $('tbody')
    
    // CONSOLIDADA:
    if ($('tbody tr').length !== 0) { // caso não encontre é porque está lidando com arquivo detalhada

        // adiciona os campos do csv à tabela consolidada
        fillTableConsolidada(arrayOfLists)

    // DETALHADA: pega o tbody e adiciona trs com tds
    } else { // sempre deve entrar no caso de um arquivo detalhada
        fillTableDetalhada(arrayOfLists)
    }
})
.fail(() => {
    console.log(`Erro no ajax, não foi possível buscar o arquivo: ${csvFilesDir}/${fileName}`)
})

// --------- TABELA DETALHADA --------------
/** Ideia 1 
 * 1 pega o nome do arquivo através do link
 * 2 busca o arquivo csv através de um $.get
 * 3 esconde o conteúdo todo da tabela consolidada
 * 4 gera uma nova tabela e insere o código (preciso do swig- ok)
 * 5 como o "voltar" do navegador iria funcionar?
 * 
 * Vantagens: 
 * 1 não precisaria gerar 12 x N tabelas por ano
 * 2 só precisaria criar o código ta tabela para usar como template
 * 
 * Desvantagens:
 * 1 Como lidar com o ir e voltrar entre tabelas consolidadas e detalhadas?
*/

/** Ideia 2 
 * 1 Pega o nome do arquivo pelo titulo dele
 * 2 busca o arquivo csv através de um $.get
 * 3 pego as informações e insiro na tabela
 * 
 * Vantagens: 
 * 1 - mais simples e fácil de fazer
 * 2 - todas as tabelas que criarei não devem ocupuar muito espaço na aplicação mesmo
 * 
 * Desvantagens:
 * 1 - terei que criar as 12 x N x ano tabelas a partir de um template
*/
