$(document).ready(function () {
  var items = [];
  var customerName = ""; // Variable to store customer name
  var prevDues = 0;
  var amountPaid = 0;

  $("#item-form").on("submit", addItemToCart);
  $("#cart-table").on("click", ".btn-danger", removeItemFromCart);
  $("#generate-invoice").on("click", generateInvoice);

  function addItemToCart(event) {
    event.preventDefault();

    var itemName = $("#item-name").val();
    var itemPrice = $("#item-price").val();
    var itemQty = parseInt($("#item-qty").val()); 

    if (
      customerName.trim() !== "" &&
      itemName.trim() !== "" &&
      itemPrice.trim() !== ""
    ) {
      var item = {
        name: itemName,
        price: parseFloat(itemPrice),
        qty: itemQty, 
      };

      items.push(item);
      $("#cart-table tbody").append(
        "<tr><td>" +
          item.name +
          "</td><td>₹" +
          item.price.toFixed(2) +
          "</td><td>" +
          item.qty +
          "</td><td>₹" +
          (item.price * item.qty).toFixed(2) +
          '</td><td><button class= "btn btn-sm btn-danger"><i class="fa fa-trash-alt"></i></button></td></tr>'
      );
      updateTotalCost();
      updateTotalQty();
      updateTotalAmt();
      $("#item-name").val("");
      $("#item-price").val("");
      $("#item-qty").val("");
    } else {
      alert("Jawaid bhai customer name, item name, and item price fill kiiye.");
    }
  }

  function removeItemFromCart() {
    updateTotalCost();
    updateTotalQty(); 
    var index = $(this).closest("tr").index();
    items.splice(index, 1);
    $(this).closest("tr").remove();
  }

  function updateTotalCost() {
    var totalCost = 0;
    items.forEach(function (item) {
      totalCost += item.price * item.qty; 
    });
    $("#total-cost").text("Amount: ₹" + totalCost.toFixed(2));
  }

  $("#prev-dues").on("input", function () {
    prevDues = parseFloat($(this).val()) || 0;
    updateTotalAmt();
  });

  $("#amount-paid").on("input", function () {
    amountPaid = parseFloat($(this).val()) || 0;
    updateCurrentDue();
  });

  // Function to update total amount
  function updateTotalAmt() {
    var totalAmt = 0;
    items.forEach(function (item) {
      totalAmt += item.price * item.qty;
    });
    totalAmt += prevDues;
    $("#total-amount").text("TOTAL : ₹" + totalAmt.toFixed(2));
    updateCurrentDue();
  }
  function updateCurrentDue() {
    var totalAmt = parseFloat($("#total-amount").text().split("₹")[1]) || 0;
    var currentDue = totalAmt - amountPaid;
    $("#current-due").text("Current Due: ₹" + currentDue.toFixed(2));
  }


  function updateTotalQty() {
    var totalQty = 0;
    items.forEach(function (item) {
      totalQty += item.qty;
    });
    $("#total-qty").text("Total Qty: " + totalQty);
  }

  var currentTime = new Date();
  var hours = currentTime.getHours();
  var minutes = currentTime.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  var timeStr = hours + ':' + minutes + ' ' + ampm;

  function generateInvoice() {
    var totalCost = getTotalCost();          
    var totalAmt = totalCost + prevDues;     
    var currentDue = totalAmt - amountPaid;  
    var totalQty = getTotalQty();            

    var currentTime = new Date();
    var hours = currentTime.getHours();
    var minutes = currentTime.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // Convert 0 to 12 for 12-hour format
    minutes = minutes < 10 ? '0' + minutes : minutes; // Add leading zero if needed
    var timeStr = hours + ':' + minutes + ' ' + ampm;

    var invoice = `
    <html>
    <head>
        <title>Invoice</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js" defer></script>

    </head>
    <body>
        <div class="container mt-1">
            <h3 class="text-center mb-0" id="savePdfButton">JAWAID DRESSES</h3>
            <p class="text-center mb-0">TELHATTA BAZAR, SIWAN</p>
            <p class="text-center mt-0">PNo. 7870123786</p>
            <hr style="border: none; border-top: 1px dotted #000; width: 100%;" />
            <p class="mb-0"><strong>Bill To: </strong> ${customerName}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <p class="mb-0"><strong>DATE:</strong> ${getCurrentDate()}</p>
                <p class="text-right mb-0"><strong>TM:</strong> ${timeStr}</p>
            </div>
            <hr style="border: none; border-top: 1px dotted #000; width: 100%; margin-bottom: 0px;" />
            <table class="table">
                <thead>
                    <tr>
                        <th style="text-align: left;">S.N</th>
                        <th style="text-align: left;">ITEM</th>
                        <th style="text-align: right;">QTY</th>
                        <th style="text-align: right;">RATE</th>
                        <th style="text-align: right;">AMNT</th>
                    </tr>
                </thead>
                <tbody>`;

    items.forEach(function (item, index) {
        invoice += `<tr>
                      <td style="text-align: left;">${index + 1}</td>
                      <td style="text-align: left;">${item.name}</td>
                      <td style="text-align: right;">${item.qty}</td>
                      <td style="text-align: right;">₹${item.price.toFixed(2)}</td>
                      <td style="text-align: right;">₹${(item.price * item.qty).toFixed(2)}</td>
                    </tr>`;
    });

    invoice += `</tbody></table><footer>
    <p class="mb-0">Total Qty: ${getTotalQty()}</p>

    <h4 style="text-align: left;" class="mb-0">Previous Dues: <span style="float: right;"> ₹${prevDues.toFixed(2)}</span></h4> 

    <h3 style="text-align: left;" class="mb-0">Total Amount: <span style="float: right;"> ₹${totalAmt.toFixed(2)}</span></h3>

    <h3 style="text-align: left;" class="mb-0">Amount Paid: <span style="float: right;"> ₹${amountPaid.toFixed(2)}</span></h3>

    <h3 style="text-align: left;" class="mb-0">Current Due: <span style="float: right;"> ₹${currentDue.toFixed(2)}</span></h3> 

    <hr style="border: none; border-top: 1px dotted #000; width: 100%;" />

    <p id="print-button" class="text-center mb-0">THANKS FOR VISIT</p>
    </footer></div></body>

    <script>
      document.getElementById('print-button').addEventListener('click', function () {
          window.print();
      });
      function saveAsPDF() {
        const element = document.body; // Choose the element that you want to print as PDF
  
        html2pdf(element, {
          margin:       1,
          filename:     'invoice.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2 },
          jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
        });
      }
  
      // Event listener for the save button
      document.getElementById('savePdfButton').addEventListener('click', saveAsPDF);
      </script>
      </html>`;

    var popup = window.open("", "_blank");
    popup.document.open();
    popup.document.write(invoice);
    popup.document.close();
}
  function getCurrentDate() {
    var currentDate = new Date();
    var dd = String(currentDate.getDate()).padStart(2, "0");
    var mm = String(currentDate.getMonth() + 1).padStart(2, "0"); // January is 0!
    var yyyy = currentDate.getFullYear();

    return dd + "/" + mm + "/" + yyyy;
  }

  function getTotalQty() {
    var totalQty = 0;
    items.forEach(function (item) {
      totalQty += item.qty;
    });
    return totalQty;
  }

  function getTotalCost() {
    var totalCost = 0;
    items.forEach(function (item) {
      totalCost += item.price * item.qty;
    });
    return totalCost;
  }

  // Function to update customer name
  $("#customer-name").on("input", function () {
    customerName = $(this).val();
  });
});
