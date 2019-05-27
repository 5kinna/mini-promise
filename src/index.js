import {PENDING,FULFILLED,REJECTED} from './const'

class MiniPromise {
    constructor(fn){
        this._status=PENDING
        this._value=null
        this._onfulfilled=[]
        this._onrejected=[]
        try{
            fn(this._resolve.bind(this),this._reject.bind(this))
        }catch(e){
            this._reject(e)
        }
    }

    isFunction(f){
       return Reflect.apply(Object.prototype.toString,f,[])==='[object Function]'
    }

    _resolve(value){
        if (value instanceof MiniPromise) {
            return value.then(resolve, reject)
          }
          setTimeout(()=>{
            if(this._status!==PENDING)return
            this._status=FULFILLED
            this._value=value
            this._onfulfilled.forEach(fn=>fn())
          },0)
    }

    _reject(value){
        setTimeout(() => {
            if(this._status!==PENDING)return
            this._status=REJECTED
            this._value=value
            this._onrejected.forEach(fn=>fn())
        }, 0);
    }

    resolutionProcedure(promise2,x,resolve,reject){
        if(promise2===x)return reject(new TypeError('error'))
        if(x instanceof MiniPromise){
            x.then(value=>{
                this.resolutionProcedure(promise2,value,resolve,reject)
            },reject)
        }
        let called = false
        if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
        try {
            const then = x.then
            if (typeof then === 'function') {
            then.call(
                x,
                y => {
                if (called) return
                called = true
                resolutionProcedure(promise2, y, resolve, reject)
                },
                e => {
                if (called) return
                called = true
                reject(e)
                }
            )
            } else {
            resolve(x)
            }
        } catch (e) {
            if (called) return
            called = true
            reject(e)
        }
        } else {
        resolve(x)
        }
    }

    then(resolve,reject){
        resolve=this.isFunction(resolve)?resolve:v=>v
        reject=this.isFunction(reject)?reject:r=>{throw r}
        let promise2
        if(this._status===FULFILLED){
            return promise2 = new MiniPromise((rs,rj)=>{
                setTimeout(() => {
                    try{
                        this.resolutionProcedure(promise2,resolve(this._value),rs,rj)
                    }catch(e){
                        rj(e)
                    }
                }, 0);
            })
        }
        if(this._status===REJECTED){
            return promise2 = new MiniPromise((rs,rj)=>{
                setTimeout(() => {
                    try{
                        this.resolutionProcedure(promise2,reject(this._value),rs,rj)
                    }catch(e){
                        rj(e)
                    }
                }, 0);
            })
        }
        if(this._status===PENDING){
            return promise2 = new MiniPromise((rs,rj)=>{
                this._onfulfilled.push(()=>{
                    try{
                        this.resolutionProcedure(promise2,resolve(this._value),rs,rj)
                    }catch(e){
                        rj(e)
                    }
                })
                this._onrejected.push(()=>{
                    try{
                        this.resolutionProcedure(promise2,reject(this._value),rs,rj)
                    }catch(e){
                        rj(e)
                    }
                })
            })
        }
    }
}

new MiniPromise((resolve, reject) => {
    setTimeout(() => {
      resolve(10000)
    }, 0)
  }).then(4).then().then(value=>{
      console.log('5555',value)
  })