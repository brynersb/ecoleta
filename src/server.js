const express = require("express")
const server = express()

//##pegar o banco de dados

const db = require("./database/db.js")

//##configurar pasta publica
server.use(express.static("public"))

//## habilitar o uso do rec.body na nossa aplicação

server.use(express.urlencoded({ extended: true }))



//##utilizando tamplate engine

const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})

//##configurar caminhos da minha aplicação

// ##pagina inicial
// ##req: requisição
// ##res: resposta

server.get("/", (req, res) => {
    return res.render("index.html")
})

server.get("/create-point", (req, res) => {

    //## rec.query: query strings da nossa url
    console.log(req.query)
    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {

    //##red.body: o corpo do nosso formulario
    //console.log(req.body)

    //enserir dados no db
    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES(?,?,?,?,?,?,?);
    `
    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items

    ]

    function afterInsertData(err) {
        if (err) {
            console.log(err)

            return res.send("Erro no cadastro!")
        }

        console.log("Cadastrado com Sucesso")
        console.log(this)

        return res.render("create-point.html", { saved: true })


    }

    db.run(query, values, afterInsertData)

})





server.get("/search", (req, res) => {

    const search = req.query.search

    if (search == "") {
        //se pesquisa vazia
        //mostrar a pagina html com todos os pontos cadastrados

        return res.render("search-results.html", { total: 0 })

    }

    //##pegar os dados do banco db
    if (search == "todos") {
        db.all(`SELECT * FROM places`, function (err, rows) {
            if (err) {
                return console.log(err)
            }

            const total = rows.length
            //##mostrar a pagina html com os dados do banco db

            return res.render("search-results.html", { places: rows, total: total })

        })
    }
    else{
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function (err, rows) {
        if (err) {
            return console.log(err)
        }

        const total = rows.length
        //##mostrar a pagina html com os dados do banco db

        return res.render("search-results.html", { places: rows, total: total })

    })
}


})

//##ligar o servidor
server.listen(3000)