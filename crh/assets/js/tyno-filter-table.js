// Filter by column - Vitor Ribeiro

/**
 * This algorithm applie a excel-like filtering in choosen columns (the columns are choosen in the filter controller). It parses each column values
 * into a set list, adds the list inside each header cell from the table, and uses it to applie a filter when the user clicks in the corresponding 
 * value inside the filter list.
 * 
 */

(function(document){

    // 1. Create filter button (like excel)
    let dropDownInput = `
        <div class="btn-group" style="position: absolute; right: 0; bottom: 0; padding: 0;">
            <button type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                <div class="arrow-down"></div>
            </button>
            <div class="dropdown-menu">

            </div>
        </div>
    `;

    let inputForm = `
        <div class="input-form-filter">
            <input class="form-filter" type="text">
        </div>
        
    `;

    let tableIds = new Map([
        ['modelo-da-apresentação', 
        {'excelFilter': [0,1,3,4], 'inputFilter': [2]}]
        // ['key', 
        // {'excelFilter': [], 'inputFilter': []}]
    ]);


    // 2. Inserts the button inside the choosen th cell
    let createFilterDropDown = (numberOfColumn="", filterChoices) => {
        // creates a button inside the choosen th cell of the table with the options list
        // https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/querySelectorAll
        // https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors
        let headerCells = document.querySelectorAll('table>thead>tr>th');
        let colNode;

        // inserts the button with an empty drop-down list
        headerCells.forEach((th, i) => {
            if (i === numberOfColumn) {
                colNode = th
                // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
                colNode.insertAdjacentHTML('beforeend', dropDownInput);
                let dropDownMenu = colNode.querySelector('.dropdown-menu');

                // fills each drop-down list with the respective filter choices from createFilterChoices()
                filterChoices.forEach(choice => {
                    let choiceItem = `<a class="dropdown-item">${choice}</a>`;
                    dropDownMenu.insertAdjacentHTML('beforeend', choiceItem);
                });
            }; 
        });        
    };

    let createFilterInputForm = (numberOfColumn) => {
        let headerCells = document.querySelectorAll('table>thead>tr>th');
        let colNode;

        // inserts the input form 
        headerCells.forEach((th, i) => {
            if (i === numberOfColumn) {
                colNode = th
                // https://developer.mozilla.org/en-US/docs/Web/API/Element/insertAdjacentHTML
                colNode.insertAdjacentHTML('beforeend', inputForm);
                let dropDownMenu = colNode.querySelector('.dropdown-menu');
            }; 
        });      
    };

    // 3. Creates a list of unique values by column to be used as filtering choices 
    let createFilterChoices = (ColumnNumberList=[], allDataRows) => {
        const filterChoicesByColumn = {};
        
        let tds; // tds list

        // a. create sets for each column number from argument
        ColumnNumberList.forEach(n => {
            filterChoicesByColumn[n] = new Set([]);
        });

        // b. For each row, picks up the content from respective column and adds to the set 
        allDataRows.forEach((tr, i) => {
            tds = tr.children; // https://developer.mozilla.org/en-US/docs/Web/API/ParentNode/children
            ColumnNumberList.forEach(n => {
                let tdChoice = tds.item(n);
                if ( tdChoice.textContent.length > 0) {
                    filterChoicesByColumn[n].add(tdChoice.textContent);
                } else { // warning: empty cells will be ignored in the filter
                    if (tdChoice.children) {
                        filterChoicesByColumn[n].add( tdChoice.innerHTML );
                    }
                }
            });
        });
        return filterChoicesByColumn;
    };

    // applies activeFilters (must be called everytime activeFilters dictionary changes)
    let applieActiveFilters = (activeFilters, allDataRows) => {

        // Show all data rows
        allDataRows.forEach(tr => {
            tr.classList.remove('invisible');
            tr.classList.remove('odd');
            tr.classList.add('visible');
        });

        if (activeFilters.size > 0) {
            // then (re)applies active filters
            activeFilters.forEach((value, key) => {
                let tds = document.querySelectorAll(`td.${key}`); // select all tds from selected column
                tds.forEach(td => {
                    // all types of filter 
                    if ( (!td.innerHTML.toLowerCase().includes(value)) && (td.innerHTML)  ) {
                        td.parentNode.classList.remove('visible');
                        td.parentNode.classList.add('invisible');
                    }
                });
            });
        }
    };

    let zebraRows = () => {
        let oddRows = document.querySelectorAll('tbody > tr.visible');
        oddRows.forEach((tr, i) => {
            if (i % 2 === 0) {
                tr.classList.remove('odd');
                tr.classList.add('odd');
            } else {
                tr.classList.remove('odd');
            }
        });
    };

    let showActiveFilters = (activeFilters) => {
        // removes class .active from all arrow-down buttons
        let allArrowButtons = document.querySelectorAll('.arrow-down');
        allArrowButtons.forEach(btn => btn.classList.remove('active'));

        // applies .active only for the current used arrow-down buttons
        if (activeFilters.size > 0) {
            activeFilters.forEach((value, key) => {
                let activeTh = document.querySelector(`th.${key}`);
                try { // if filter corresponds to the arrow buttons (excel-like filtering)
                    let currentArrowButton = activeTh.querySelector('.arrow-down');
                    currentArrowButton.classList.add('active');
                } catch (error) {
                    console.log("Passei por um filtro de formulário");
                }
                
            });
        }
    };
    
    // Filter Controller 

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
    let activeFilters = new Map(); // Map(2) {"col__1" => "FLORESTAL", "col__2" => "ESTOQUES"}

    let rowHeader = document.querySelector('table>thead>tr');
    let clearFilterButton = document.querySelector('.filter__clear').firstElementChild;
    let allDataRows = document.querySelectorAll('tbody>tr');

    applieActiveFilters(activeFilters, allDataRows); 
    zebraRows(); // applie zebra rows to all body rows for the first time    
    
    // Excel-like Filtering
    rowHeader.addEventListener('click', (event) => {
        // This event handles the filter by column (filter are cumulative)
        // because of the emoticons, I have to handle different event.target (<a> or <i>)
        let column, anchor, divDropDown, targetValue; // anchor = <a>
        let buttonArrowDown = document.querySelector('.arrow-down');
        if (event.target.tagName.toLowerCase() === 'a') {
                column = event.path[3].className.split(' ')[0];
                anchor = event.target;
                divDropDown = event.path[1];
                event.target.children.length === 0 ? targetValue = event.target.textContent : targetValue = event.target.innerHTML; // ??
        } else {
            column = event.path[4].className.split(' ')[0];
            anchor = event.target.parentNode;
            divDropDown = event.path[2];
            targetValue = event.target.parentNode.innerHTML;
        }
        // console.log(divDropDown) // test
        // console.log(targetValue) // test
        
        if ( column.startsWith('col__')) {
            if ( !anchor.classList.contains('active')) {
                // removes all other actives (from current <div>) and add .active to the current selection
                Array.from(divDropDown.children).forEach(anchor => anchor.classList.remove('active')); // removes the .active 
                anchor.classList.add('active'); // add .active to <a> class

                // add current selection to activeFilters
                activeFilters.set(column, targetValue.toLowerCase());

                // applie activeFilters
                applieActiveFilters(activeFilters, allDataRows);

                // applie zebra rows
                zebraRows();

                // show active filters
                showActiveFilters(activeFilters);
            } else {
                // removes all .active classes (from current <ul>)
                Array.from(divDropDown.children).forEach(anchor => anchor.classList.remove('active')); // removes the .active 

                // removes current filter from activeFilters
                activeFilters.delete(column);

                // applie activeFilters
                applieActiveFilters(activeFilters, allDataRows);

                // applie zebra rows
                zebraRows();

                // show active filters
                showActiveFilters(activeFilters);
            }
        }
    });

    // input filtering
    rowHeader.addEventListener('input', (event) => {
        let targetValue = event.target.value;
        let column = event.path[2].className.split(' ')[0];
        if (targetValue.length > 0) {
            // add current target value to activeFilters
            activeFilters.set(column, targetValue.toLowerCase());

            // applie activeFilters
            applieActiveFilters(activeFilters, allDataRows);

            // applie zebra rows
            zebraRows();
        
        } else {

            // remove last target value from activeFilters
            activeFilters.delete(column);

            // applie activeFilters
             applieActiveFilters(activeFilters, allDataRows);

            // applie zebra rows
            zebraRows();
        }
    });


    // Clear filter Button
    clearFilterButton.addEventListener('click', event => {
        let allUlDropDowns = document.querySelectorAll('.dropdown-menu');
        let formFilters = document.querySelectorAll('.form-filter');
        // removes all .active classes
        allUlDropDowns.forEach(ul => {
            Array.from(ul.children).forEach(li => {li.classList.remove('active')}); // removes the .active
        });  

        // erase text from input forms
        formFilters.forEach(form => form.value = "");

        // erase active filters
        activeFilters = new Map();

        // applie active filters
        applieActiveFilters(activeFilters, allDataRows);

        // show active filters
        showActiveFilters(activeFilters);

        // zebra rows
        zebraRows();
    });

    let tableElement = document.querySelector('table');
   
    // Dinamically create filters for each table
    let tableFiltersObj = tableIds.get(tableElement.id);
    let filterChoicesObject = createFilterChoices(tableFiltersObj.excelFilter, allDataRows);

    tableFiltersObj.excelFilter.forEach(n => createFilterDropDown(n, filterChoicesObject[n]));
    tableFiltersObj.inputFilter.forEach(n => createFilterInputForm(n));

})(document)