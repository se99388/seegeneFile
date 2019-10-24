(() => {

    const form = document.querySelector('form');
    form.addEventListener('submit', e => {
        e.preventDefault();
        if (document.getElementById('seegeneFile').files[0]){
            const file = document.getElementById('seegeneFile').files[0];
            console.log(file.name);
            console.log(file.name.match(/.csv/));
            if (file.name.match(/.csv/)) {
                const formData = new FormData(myForm);
                formData.append("seegeneFile", file);
                console.log(formData);
                fetch("http://localhost:3000/storeToArchiveFile", { method: "POST", body: formData })
                    .then((response) => {
                        console.log(response);
                        if (response.status === 201) {
                            response.json().then((data) => {
                                console.log(data);
                                alert(data.message);
                                document.getElementById('seegeneFile').value = "";
                            });
                        }
                        else {
                            alert("Error: status number" + response.status + ", " + response.statusText);
                        }
    
                    })
                    .catch((err) => {
                        console.log(err);
                        alert("Error:", err);
                    });
            }
            else {
                alert("The file " + file.name + ", is a wrong file");
            }
        }
        else{
            alert("You have to choose a file")
        }
     
    });

})();
