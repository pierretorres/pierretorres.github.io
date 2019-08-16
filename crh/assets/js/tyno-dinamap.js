/**
 * Module to handle interactive brazil map that generates dinamic content
 * based on state clicked
*/

const states = {
    // Norte
    'path48': 'AM', 'path46': 'AC', 'path50': 'RR', 'path52': 'AP',
    'path86': 'PA', 'path44': 'RO', 'path54': 'TO',

    // Nordeste
    'path82': 'PE', 'path84': 'MA', 'path70': 'PI', 'path72': 'CE',
    'path74': 'RN', 'path96': 'PB', 'path': 'AL', 'path78': 'SE',
    'path68': 'BA',
    
    // Centro-Oeste
    'path80': 'DF', 'path56': 'MT', 'path58': 'GO', 'path60': 'MS',

    // Sudeste
    'path62': 'MG', 'path88': 'SP', 'path90': 'RJ', 'path92': 'ES',

    // Sul
    'path66': 'RS', 'path64': 'PR', 'path94': 'SC',

};

let statesContent = {
    'DEFAULT': {
        'content': `
        <div class="dynamicWindow__frame">
            <h3>Mapa Interativo</h3> 
            <!-- for showing text content -->
            <div class="dynamicWindow__description">
                <p>Os estados do mapa podem ser clicados. Cada estado possui informações que irão aparecer nesta janela.</p>
            </div>
        </div>
        `
    },
    'AM': {
        'content': `
        <div class="dynamicWindow__frame">
            <h3>Amazonas</h3> 
            <div class="dynamicWindow__item">
                <!-- clickable icons and text -->
                <a href="#Amazonas">
                    <i class="flaticon-help"></i>
                    <span>Amazonas</span>
                </a>
            </div>
    
            <!-- for showing text content -->
            <div class="dynamicWindow__description">
                <h4>Maecenas</h4>
                <p>&rarr; Suspendisse pulvinar</p>
                <p>&#8611; Suspendisse pulvinar</p>
            </div>
    
            <div class="dynamicWindow__img">
                <img src="../../assets/img/dinamap_img.png" alt="">
            </div>
        </div>
        `
    },
    'BA': {
        'title': 'Bahia',
        'content': `
        <div class="dynamicWindow__frame">
            <h3>Bahia</h3>
            <div class="dynamicWindow__item">
                <!-- clickable icons and text -->
                <a href="#Bahia">
                    <i class="flaticon-help"></i>
                    <span>Bahia</span>
                </a>
            </div>
    
            <!-- for showing text content -->
            <div class="dynamicWindow__description">
                <h4>Maecenas</h4>
                <p>&rarr;  Suspendisse pulvinar</p>
                <p>&#8611;  Suspendisse pulvinar</p>
            </div>
    
            <div class="dynamicWindow__img">
                <img src="../../assets/img/dinamap_img.png" alt="">
            </div>
        </div>
        `
    }
};

$(".svgMap").click(function (e) {
    let stateInitials = e.target.id ? states[e.target.id] : e.target.classList[0];
    
    // insert content (if exists) inside dynamicWindow
    if (statesContent[stateInitials]) {

        // remove previous state content
        $('.dynamicWindow').empty();

        // insert current state content
        $('.dynamicWindow').prepend(statesContent[stateInitials].content)

    }  
})