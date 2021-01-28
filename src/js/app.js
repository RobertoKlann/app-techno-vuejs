const techno = new Vue({
    el: '#app',
    data: {
        produtos: [],
        produto: null,
        carrinhoTotal: 0,
        carrinho: [],
        mensagemAlerta: "Item adicionado",
        alertaAtivo: false,
        carrinhoAtivo: false
    },
    filters: {
        formaterPreco(valor) {
            return valor.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        }
    },
    computed: {
        totalCarrinho() {
            let total = 0;

            if(this.carrinho.length > 0) {
                this.carrinho.forEach((item) => {
                    total+= item.preco;
                });
            }

            return total;
        }
    },
    methods: {
        fetchProdutos() {
            fetch('../../../api/produtos.json').then(r => r.json()).then(r => {
                this.produtos = r;
            });
        },
        fetchProduto(id) {
            fetch(`../../../api/produtos/${id}/dados.json`).then(r => r.json()).then(r => {
                this.produto = r;
            });
        },
        abrirModal(id) {
            this.fetchProduto(id);
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        },
        fecharModal({target, currentTarget}) {
            if(target == currentTarget)
                this.produto = false;
        },
        clickForaCarrinho({target, currentTarget}) {
            if(target == currentTarget)
                this.carrinhoAtivo = false;
        },
        adicionarCarrinho() {
            this.produto.estoque--;            

            const {id, nome, preco} = this.produto;

            this.alerta(`${nome} adicionado ao carrinho.`);

            this.carrinho.push({id, nome, preco});
        },
        removerItem(index) {
            this.carrinho.splice(index, 1);

            this.alerta(`Produto removido do carrinho.`);
        },
        checarLocalStorage() {
            if(localStorage.getItem('@carrinho')) {
                this.carrinho = JSON.parse(localStorage.getItem('@carrinho'));
            }
        },
        compararEstoque() {
            const items = this.carrinho.filter(({ id }) => id === this.produto.id);
            this.produto.estoque -= items.length;
        },
        alerta(mensagem) {
            this.mensagemAlerta = mensagem;
            this.alertaAtivo = true;

            setTimeout(() => {
                this.alertaAtivo = false;
            }, 1500);
        },
        router() {
            const hash = document.location.hash;

            if(hash) {
                this.fetchProduto(hash.replace('#', ''));
            }
        }
    },
    watch: {
        carrinho() {
            localStorage.setItem('@carrinho', JSON.stringify(this.carrinho));
        },
        produto() {
            document.title = this.produto.nome || "Techno";

            const hash = this.produto.id || "";

            history.pushState(null, null, `#${hash}`);

            this.compararEstoque();
        }
    },
    created() {
        this.fetchProdutos();
        this.router();
        this.checarLocalStorage();
    }
});