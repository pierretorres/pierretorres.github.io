// ==========================================
//============ Funções ======================
// ==========================================
let removeAlert = () => {
    $('.alert').remove()
}

let cleanSearchField = (idInputForm) => {
    // idInputForm ex: '#inputDescription'
    $(idInputForm).val("")

}

let getSearchFieldInput = (idInputForm) => {
    // idInputForm ex: '#inputCodItem'
    let inputField = $(idInputForm).val()

    // console.log(`InputField from getSearchFieldInput: ${inputField}`) // debug


    return inputField
}

let showAllLines = () => {
    $('.report__row').removeClass('invisible')
}

let filterLines = ({codItemFilter = "", descriptionFilter = ""}) => {
    // recebe um objeto contendo os argumentos
    // filtra ou pelo código do item ou pela descrição
    let match = false

    if (codItemFilter) {
        if (codItemFilter !== "") {
            $('.code__link').each(function(i){
                let codItem = $(this).text()
                // console.log(codItem) // debug
                if (codItem !== codItemFilter){ // filtra pelo valor exato
                    // console.log(`${codItem} __ ${codItemFilter} = ${codItem !== codItemFilter}`) // debug
                    console.log( $(this) ) // debug
                    $(this).parent().parent().parent().addClass('invisible') // adiciona invisible a class="report__row" 
                } else {
                    match = true
                }
            })
        } else {
            alert("Você esqueceu de preencher o campo de pesquisa")
        }

    } else if(descriptionFilter) {
        if (descriptionFilter !== "") {
            $('.description__text').each(function(i){
                let description = $(this).text()
        
                if (!description.includes(descriptionFilter)){ // filtra se o valor procurado está contido na descrição
                    $(this).parent().parent().addClass('invisible') // adiciona invisible a class="report__row"
                } else {
                    match = true
                }
            })
        } else {
            alert("Você esqueceu de preencher o campo de pesquisa")
        }
    }
    console.log(`codItem: ${codItemFilter}, description: ${descriptionFilter}, match: ${match}.`) // debug
    // caso não ache nenhum valor correspondente a pesquisa
    if (match === false) {
        $('.reports').append(`<div class="alert alert-info" role="alert">Nenhum laudo encontrado.</div>`)
    }
}

let zebraRows = () => {
    $('tr.report__row').removeClass('odd');
    let oddRows = $('tr.report__row').not('.invisible') // seleciona as linhas, menos as invisiveis
    oddRows.each(function(i) {
        if (i % 2 === 0) {
            $( this ).removeClass('odd');
            $( this ).addClass('odd');
        } else {
            $( this ).removeClass('odd');
        }

    });
};

//  click event do botão filtrar de CODITEM
$('#searchReports').click(function(event){

    // remove o alerta de "laudos não encontrado"
    removeAlert()

    // pega o conteúdo da pesquisa
    let codItemFilter = getSearchFieldInput('#inputCodItem')
    let descriptionFilter = getSearchFieldInput('#inputDescription')


    // apaga o conteúdo da pesquisa do outro campo
    if (codItemFilter) {
        cleanSearchField('#inputDescription')
        // mostra todas as linhas
        showAllLines()
        
        // esconde linhas que não são iguais ao filtro
        filterLines({codItemFilter})

        // aplica linhas estilo zebra
        zebraRows()
    } else {
        // esconde linhas que não são iguais ao filtro
        filterLines({descriptionFilter})

        // aplica linhas estilo zebra
        zebraRows()
    }

    
})

// click event do botão filtrar de DESCRIÇÂO
// $('#descriptionFilter').click(function(event){

//     // remove o alerta de "laudos não encontrado"
//     removeAlert()

//     // apaga o conteúdo da pesquisa do outro campo
//     cleanSearchField('#inputCodItem')

//     // mostra todas as linhas
//     showAllLines()

//     // pega o conteúdo da pesquisa
//     let descriptionFilter = getSearchFieldInput('#inputDescription')

    
// })

// caso o usuário apague sua pesquisa, todos os laudos voltam a aparecer

$('#inputCodItem').keyup(function(e){
    if (e.which === 8 && $(this).val() === "") {
        showAllLines()
        zebraRows()
        removeAlert()

    } else if (e.which === 13 && $(this).val() !== "") {

        // --------- TODO ENCAPSULAR ISSO AQUI -------------
        // remove o alerta de "laudos não encontrado"
        removeAlert()

        // apaga o conteúdo da pesquisa do outro campo
        cleanSearchField('#inputDescription')

        // mostra todas as linhas
        showAllLines()

        // pega o conteúdo da pesquisa
        let codItemFilter = getSearchFieldInput('#inputCodItem')
        
        // esconde linhas que não são iguais ao filtro
        filterLines({codItemFilter})

        // aplica linhas estilo zebra
        zebraRows()
    }
})

$('#inputDescription').keyup(function(e){
    if (e.which === 8 && $(this).val() === "") {
        showAllLines()
        zebraRows()
        removeAlert()

    } else if (e.which === 13 && $(this).val() !== "") {

        // remove o alerta de "laudos não encontrado"
        removeAlert()

        // apaga o conteúdo da pesquisa do outro campo
        cleanSearchField('#inputCodItem')        

        // mostra todas as linhas
        showAllLines()

        // pega o conteúdo da pesquisa
        let descriptionFilter = getSearchFieldInput('#inputDescription')

        // esconde linhas que não são iguais ao filtro
        filterLines({descriptionFilter})

        // aplica linhas estilo zebra
        zebraRows()

    }
})

// botão Limpar
$('.cleanButton').click(function(e){

    // limpar input
    cleanSearchField('#inputCodItem')
    cleanSearchField('#inputDescription')
 
    // remove alert
    removeAlert()

    // mostrar linhas
    showAllLines()

    // aplica linhas estilo zebra
    zebraRows()

})

// aplica linhas estilo zebra ao inicializar a página
zebraRows()