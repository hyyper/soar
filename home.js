// Format Currency
function _currencyFormat(num) {
    return '$' + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

$(function() {

    // Converts a relative path within an app/extension install directory to a fully-qualified URL.
    var imgURL = chrome.runtime.getURL("calculate-icon.png");

    // Loop through each Table Row
    $('table > tbody > tr').each(function() {

        // Get Parent Tag of MarketCap data
        var marketCap = $(this).find('td:nth-child(3)');

        // Add Edit Button
        marketCap.find('p').append(`<img src="${imgURL}" class="icon">`);

    });


    // Binding Click Event to Table Row
    $(document).on('click', 'table > tbody > tr', function() {

        // Get Parent Tag of MarketCap data
        var marketCap = {
            'tableData': $(this).find('td:nth-child(3)')
        };

        // Check if Input field is already added
        if(marketCap.tableData.find('p').length === 0) { return; }

        // Get MarketCap data and sterilize it
        marketCap.dollar = marketCap.tableData.find('p').text().replace(/[^0-9\.,]/g,'');

        // Get parent of Price data
        var price = $(this).find('td:nth-child(4) > a').text();

        var circulatingSupply  = {
            'tableData': $(this).find('td:nth-child(6)')
        };

        // Get Circulating Supply Amount
        circulatingSupply.amount = circulatingSupply.tableData
            .find('div').text().split( ' ')[0]
            .replace(/[^0-9\.]/g,'');



        // Store State
        var store = {
            'circulatingSupply': circulatingSupply.amount,
            'marketCap'        : marketCap.dollar,
            'price'            : price,
            'priceHTML'        : marketCap.tableData.html()
        }

        // Inject Input field & Reset Icon
        marketCap.tableData.html(`<input type='text' value='${store.marketCap}' data-store='${JSON.stringify(store)}' style='margin-right: 15px;'><button class='reset'>Reset</button>
        <div class='percentageDifference'>Percentage Difference: 0.00%</div>`);

        // Focus on Text field
        marketCap.tableData.children('input[type="text"]').focus();

    });


    // Resets calculation and closes
    $(document).on('click', '.reset', function(event) {
        event.stopPropagation()

        var field = $(this).siblings();
        var store = JSON.parse(field[0].dataset.store);

        // Reset Price
        $(this).parent().parent().find('td:nth-child(4) > a').text(store.price);
        // Reinsert original html
        $(this).parent().html(store.priceHTML);

    });


    $(document).on('change textInput input', 'input[type="text"]', function() {

        // Get field value
        var marketCap         = $(this).val() || 0.00;
        // Clean field value
        var marketCapAmount   = marketCap.replace(/[^0-9\.]/g,'');

        // Get CirculatingSupply
        var circulatingSupply = $(this).data('store').circulatingSupply;

        var originalPriced    = $(this).data('store').price.replace(/[^0-9\.]/g,'');


        // Select current Price
        var price = $(this).parent().parent().find('td:nth-child(4) > a');

        // Calculate new Price
        var calculatedPrice = parseInt(marketCapAmount) / parseInt(circulatingSupply);


        var PERCENTAGE_DIFFERENCE = (((calculatedPrice - originalPriced ) / originalPriced ) * 100).toFixed(2);

        $(this).parent().find('.percentageDifference').text(`Percentage Difference: ${PERCENTAGE_DIFFERENCE}%`)


        // Update Price display
        price.text(`${_currencyFormat(calculatedPrice)}`);

    });

});