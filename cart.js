import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';


const apiUrl = 'https://vue3-course-api.hexschool.io';
const apiPath = 'wweilin';

const productModal = {
    // 當id變動時 取得遠端資料 並呈現modal
    props: ['id', 'addToCart', 'loadingItem', 'openModal'],
    data() {
        return {
            modal: {},
            tempProduct: {},
            qty: 1,
            modalLoading: ''
        }
    },
    template: '#userProductModal',
    watch: {
        id() {
            console.log('watch的id', this.id);
            if (this.id) {
                this.modalLoading = this.id;
                this.changeLoading();
                axios.get(`${apiUrl}/v2/api/${apiPath}/product/${this.id}`).then(resp => {
                    console.log('單一產品', resp.data.product);
                    this.tempProduct = resp.data.product;
                    this.modal.show();
                    this.modalLoading = '';
                    this.changeLoading();
                })
            }
        }
    },
    methods: {
        hide() {
            this.modal.hide();
        },
        changeLoading() {
            this.$emit('changeLoading', this.modalLoading);
        }
    },
    mounted() {
        this.modal = new bootstrap.Modal(this.$refs.modal);
        // 監聽dom 當modal關閉時 需要清空id 避免watch的bug
        this.$refs.modal.addEventListener('hidden.bs.modal', () => {
            // this.id = ''
            this.openModal('')
        })
    },
}

// 載入驗證的全部規則
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});
// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');
// Activate the locale
VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'),
    validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const app = createApp({
    data() {
        return {
            products: [],
            productId: '',
            cart: [],
            loadingItem: '', // 存ID
            user: {}
        }
    },
    methods: {
        getProducts() {
            axios.get(`${apiUrl}/v2/api/${apiPath}/products/all`).then(resp => {
                this.products = resp.data.products;
            })
        },
        openModal(id) {
            this.productId = id;
            console.log('外層帶入的id', this.productId)
        },
        addToCart(product_id, qty = 1) {
            const data = {
                product_id,
                qty
            };
            this.loadingItem = product_id + '1';
            axios.post(`${apiUrl}/v2/api/${apiPath}/cart`, { data }).then(resp => {
                console.log('加入購物車', resp.data);
                this.$refs.productModal.hide();
                this.getCarts();
                this.loadingItem = '';
            })
        },
        getCarts() {
            axios.get(`${apiUrl}/v2/api/${apiPath}/cart`).then(resp => {
                console.log("購物車", resp.data.data);
                this.cart = resp.data.data
            })
        },
        updateCartItem(item) {
            const data = {
                product_id: item.product.id,
                qty: item.qty
            };
            this.loadingItem = item.id; // 當剛觸發時 儲存id
            axios.put(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`, { data }).then(resp => {
                console.log("更新購物車", resp.data.data);
                this.getCarts();
                this.loadingItem = '';  // 待更新完成之後 清空id 以此做為判斷loading的依據
            })
        },
        deleteItem(item) {
            this.loadingItem = item.id;
            axios.delete(`${apiUrl}/v2/api/${apiPath}/cart/${item.id}`).then(resp => {
                console.log("刪除購物車", resp.data.data);
                this.getCarts();
                this.loadingItem = '';
            })
        },
        changeLoading(modalLoading) {
            this.loadingItem = modalLoading;
        },
        onSubmit() {
            console.log('送出表單')
        }
    },
    components: {
        productModal,
    },
    mounted() {
        this.getProducts();
        this.getCarts();
    },
});

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app')