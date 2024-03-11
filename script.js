$(document).ready(function() {
    $("#fileInput").on("change", function(event) {
        var file = event.target.files[0];
        var reader = new FileReader();

        reader.onload = function(event) {
            var typedarray = new Uint8Array(event.target.result);
            pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
                var pageNum = 1;
                pdf.getPage(pageNum).then(function(page) {
                    page.getTextContent().then(function(textContent) {
                        var text = "";
                        textContent.items.forEach(function(item) {
                            text += item.str + ",";
                        });
						text = text.replace(/,\s,/gm, ";").replace(/,,/gm, "\n");
                        // Converte o texto em uma tabela HTML
                        var table = $("<table border='1'>'");
                        var lines = text.split("\n");
                        var headers = lines[0].split(";");
                        lines.forEach(function(line, index) {
                            var row = $("<tr>");
                            var cells = line.split(";");
                            cells.forEach(function(cell) {
                                var col = $("<td>").text(cell);
                                row.append(col);
                            });
                            table.append(row);
                        });

                        // Converte a tabela HTML em JSON
                        var json = [];
                        table.find('tr').each(function(rowIndex, r) {
                            if (rowIndex !== 0) {
                                var rowData = {};
                                $(this).find('td').each(function(colIndex, c) {
                                    rowData[headers[colIndex]] = $(this).text();
                                });
                                json.push(rowData);
                            }
                        });

                        // Exibe a tabela HTML
                        $("#tableContainer").empty().append(table);

                        // Exibe o JSON
                        console.log(JSON.stringify(json));
                    });
                });
            });
        };

        reader.readAsArrayBuffer(file);
    });
});
