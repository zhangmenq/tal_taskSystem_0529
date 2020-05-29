import Vue from 'vue'
import Router from 'vue-router'
import Answer from '@/views/answer'
import Index from '@/views/index'
import Detail from '@/views/details'
import Preview from '@/views/preview'
import Wrong from '@/views/wrong'
Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            redirect: '/index'
        },
        {
            path: '/index',
            name: 'index',
            component: Index
        },
        {
            path: '/answer/:id/type/:type',
            name: 'answer',
            component: Answer
        },
        {
            path: '/details/:id',
            name: 'details',
            component: Detail
        },
        {
            path: '/preview',
            name: 'preview',
            component: Preview
        },
        {
            path: '/wrong/:id/type/:type',
            name: 'wrong',
            component: Wrong  
        }
    ]
})
