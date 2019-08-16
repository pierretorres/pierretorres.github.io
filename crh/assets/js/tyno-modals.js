/**
 * Esse módulo constroi os links das caixas dos fluxos com os modais respectivos
 */


// identificar os elementos de caixa/processo no fluxograma
// https://api.jquery.com/category/selectors/attribute-selectors/
$(`[xmlns|="http://www.w3.org/1999/xhtml"]`).each(function() {
    let boxText = $(this).text();
    
    // o texto da caixa é usado para identificar ids dos modais
    let stringForSearch = boxText.toLowerCase().replace(/\s/g, "_");

    // procurar os modais cujos id sejam iguais ao texto tratado de cada caixa
    let modal = $(`[id|="${stringForSearch}"]`);
    
    // associar caixas com os respectivos modais, se houverem.
    if (modal.length > 0) {
        $(this).wrap(`<a class="modal__link" data-toggle="modal" data-target="#${modal.attr('id')}" style="cursor: pointer;"></a>`);    
    }
});





