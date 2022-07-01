
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.48.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var storage = self.localStorage;
    // || {
    //   setItem(key, value) {
    //     return chrome.storage.local.set({ [key]: value });
    //   },
    //   getItem(key) {
    //     return chrome.storage.local.get(key).then(({ [key]: value }) => value);
    //   },
    //   removeItem(key) {
    //     return chrome.storage.local.remove(key);
    //   },
    //   clear() {
    //     return chrome.storage.local.clear();
    //   },
    // };

    const BN = TonWeb.utils.BN;
    const nacl = TonWeb.utils.nacl;
    const Address = TonWeb.utils.Address;
    const formatNanograms = TonWeb.utils.fromNano;

    let extensionWindowId = -1;
    let contentScriptPorts = new Set();
    let popupPort = null;
    const queueToPopup = [];

    let dAppPromise = null;

    const createDappPromise = () => {
      if (dAppPromise) dAppPromise.resolve(false);

      let resolve;
      let reject;

      dAppPromise = new Promise((localResolve, localReject) => {
        resolve = localResolve;
        reject = localReject;
      });

      dAppPromise.resolve = (...args) => {
        resolve(...args);
        dAppPromise = null;
      };
      dAppPromise.reject = (...args) => {
        reject(...args);
        dAppPromise = null;
      };
    };

    const showExtensionWindow = () => {
      return new Promise(async (resolve) => {
        if (extensionWindowId > -1) {
          chrome.windows.update(extensionWindowId, { focused: true });
          return resolve();
        }

        const windowState = (await storage.getItem('windowState')) || {};

        windowState.top = windowState.top || 0;
        windowState.left = windowState.left || 0;
        windowState.height = windowState.height || 800;
        windowState.width = windowState.width || 480;

        chrome.windows.create(
          Object.assign(windowState, {
            url: 'index.html',
            type: 'popup',
            focused: true,
          }),
          (window) => {
            extensionWindowId = window.id;
            resolve();
          }
        );
      });
    };

    // ENCRYPTION

    /**
     * @param plaintext {string}
     * @param password {string}
     * @return {Promise<string>}
     */
    async function encrypt(plaintext, password) {
      const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
      const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8); // hash the password

      const iv = crypto.getRandomValues(new Uint8Array(12)); // get 96-bit random iv

      const alg = { name: 'AES-GCM', iv: iv }; // specify algorithm to use

      const key = await crypto.subtle.importKey('raw', pwHash, alg, false, [
        'encrypt',
      ]); // generate key from pw

      const ptUint8 = new TextEncoder().encode(plaintext); // encode plaintext as UTF-8
      const ctBuffer = await crypto.subtle.encrypt(alg, key, ptUint8); // encrypt plaintext using key

      const ctArray = Array.from(new Uint8Array(ctBuffer)); // ciphertext as byte array
      const ctStr = ctArray.map((byte) => String.fromCharCode(byte)).join(''); // ciphertext as string
      const ctBase64 = btoa(ctStr); // encode ciphertext as base64

      const ivHex = Array.from(iv)
        .map((b) => ('00' + b.toString(16)).slice(-2))
        .join(''); // iv as hex string

      return ivHex + ctBase64; // return iv+ciphertext
    }

    /**
     * @param ciphertext {string}
     * @param password {string}
     * @return {Promise<string>}
     */
    async function decrypt(ciphertext, password) {
      const pwUtf8 = new TextEncoder().encode(password); // encode password as UTF-8
      const pwHash = await crypto.subtle.digest('SHA-256', pwUtf8); // hash the password

      const iv = ciphertext
        .slice(0, 24)
        .match(/.{2}/g)
        .map((byte) => parseInt(byte, 16)); // get iv from ciphertext

      const alg = { name: 'AES-GCM', iv: new Uint8Array(iv) }; // specify algorithm to use

      const key = await crypto.subtle.importKey('raw', pwHash, alg, false, [
        'decrypt',
      ]); // use pw to generate key

      const ctStr = atob(ciphertext.slice(24)); // decode base64 ciphertext
      const ctUint8 = new Uint8Array(
        ctStr.match(/[\s\S]/g).map((ch) => ch.charCodeAt(0))
      ); // ciphertext as Uint8Array
      // note: why doesn't ctUint8 = new TextEncoder().encode(ctStr) work?

      const plainBuffer = await crypto.subtle.decrypt(alg, key, ctUint8); // decrypt ciphertext using key
      const plaintext = new TextDecoder().decode(plainBuffer); // decode password from UTF-8

      return plaintext; // return the plaintext
    }

    // CONTROLLER

    const IS_EXTENSION = !!(
      self.chrome &&
      chrome.runtime &&
      chrome.runtime.onConnect
    );

    const ACCOUNT_NUMBER = 0;

    const DEFAULT_WALLET_VERSION = 'v3R2';
    const DEFAULT_LEDGER_WALLET_VERSION = 'v3R1';

    class Controller {
      constructor() {
        this.isTestnet = false;
        this.isDebug = false;
        /** @type {string} */
        this.myAddress = null;
        /** @type {string} */
        this.publicKeyHex = null;
        /** @type {string[]} */
        this.myMnemonicWords = null;
        /** @type   {BN | null} */
        this.balance = null;
        /** @type {WalletContract} */
        this.walletContract = null;
        this.transactions = [];
        this.updateIntervalId = 0;
        this.lastTransactionTime = 0;
        this.isContractInitialized = false;
        this.sendingData = null;
        this.processingVisible = false;

        this.ledgerApp = null;
        this.isLedger = false;

        if (self.view) {
          self.view.controller = this;
        }

        this.pendingMessageResolvers = new Map();
        this._lastMsgId = 1;

        this.whenReady = this._init();
      }

      debug(...args) {
        if (!this.isDebug) return;
        console.log(...args);
      }

      /**
       * @param words {string[]}
       * @return {Promise<string>}
       */
      static async wordsToPrivateKey(words) {
        const keyPair = await TonWeb.mnemonic.mnemonicToKeyPair(words);
        return TonWeb.utils.bytesToBase64(keyPair.secretKey.slice(0, 32));
      }

      /**
       * @param words {string[]}
       * @param password  {string}
       * @return {Promise<void>}
       */
      static async saveWords(words, password) {
        await storage.setItem('words', await encrypt(words.join(','), password));
      }

      /**
       * @param password  {string}
       * @return {Promise<string[]>}
       */
      static async loadWords(password) {
        return (await decrypt(await storage.getItem('words'), password)).split(',');
      }

      async getWallet() {
        return this.ton.provider.getWalletInfo(this.myAddress);
      }

      checkContractInitialized(getWalletResponse) {
        return getWalletResponse.account_state === 'active';
      }

      /**
       * @return {BN} in nanograms
       */
      getBalance(getWalletResponse) {
        return new BN(getWalletResponse.balance);
      }

      async _init() {
        return new Promise(async (resolve) => {
          await storage.removeItem('pwdHash');

          this.isTestnet = IS_EXTENSION
            ? await storage.getItem('isTestnet')
            : self.location.href.indexOf('testnet') > -1;
          this.isDebug = IS_EXTENSION
            ? await storage.getItem('isDebug')
            : self.location.href.indexOf('debug') > -1;

          const mainnetRpc = 'https://toncenter.com/api/v2/jsonRPC';
          const testnetRpc = 'https://testnet.toncenter.com/api/v2/jsonRPC';

          const apiKey = this.isTestnet
            ? TONCENTER_API_KEY_WEB_TEST
            : TONCENTER_API_KEY_WEB_MAIN;
          const extensionApiKey = this.isTestnet
            ? TONCENTER_API_KEY_EXT_TEST
            : TONCENTER_API_KEY_EXT_MAIN;

          if (IS_EXTENSION && !(await storage.getItem('address'))) {
            await this._restoreDeprecatedStorage();
          }

          this.ton = new TonWeb(
            new TonWeb.HttpProvider(this.isTestnet ? testnetRpc : mainnetRpc, {
              apiKey: IS_EXTENSION ? extensionApiKey : apiKey,
            })
          );
          this.myAddress = await storage.getItem('address');
          this.publicKeyHex = await storage.getItem('publicKey');

          if (!this.myAddress || !(await storage.getItem('words'))) {
            await storage.clear();
            this.sendToView('showScreen', { name: 'start', noAnimation: true });
          } else {
            if ((await storage.getItem('isLedger')) === 'true') {
              this.isLedger = true;
              this.sendToView('setIsLedger', this.isLedger);
            }

            await this.showMain();
          }
          this.sendToView('setIsTestnet', this.isTestnet);

          resolve();
        });
      }

      async _restoreDeprecatedStorage() {
        const { address, words, walletVersion, magic, proxy } =
          await this.sendToView('restoreDeprecatedStorage', undefined, true, true);

        if (!address || !words) {
          return;
        }

        await Promise.all([
          storage.setItem('address', address),
          storage.setItem('words', words),
          storage.setItem('walletVersion', walletVersion),
          storage.setItem('magic', magic),
          storage.setItem('proxy', proxy),
        ]);
      }

      async toggleTestnet() {
        this.isTestnet = !this.isTestnet;
        if (this.isTestnet) {
          await storage.setItem('isTestnet', 'true');
        } else {
          await storage.removeItem('isTestnet');
        }
        this.clearVars();
        await this._init();
        await this.sendToView('setIsTestnet', this.isTestnet);
      }

      async toggleDebug() {
        this.isDebug = !this.isDebug;
        if (this.isDebug) {
          await storage.setItem('isDebug', 'true');
        } else {
          await storage.removeItem('isDebug');
        }
      }

      async getTransactions(limit = 20) {
        function getComment(msg) {
          if (!msg.msg_data) return '';
          if (msg.msg_data['@type'] !== 'msg.dataText') return '';
          const base64 = msg.msg_data.text;
          return new TextDecoder().decode(TonWeb.utils.base64ToBytes(base64));
        }

        const arr = [];
        const transactions = await this.ton.getTransactions(this.myAddress, limit);
        for (let t of transactions) {
          let amount = new BN(t.in_msg.value);
          for (let outMsg of t.out_msgs) {
            amount = amount.sub(new BN(outMsg.value));
          }
          //amount = amount.sub(new BN(t.fee));

          let from_addr = '';
          let to_addr = '';
          let comment = '';
          if (t.in_msg.source) {
            // internal message with grams, set source
            from_addr = t.in_msg.source;
            to_addr = t.in_msg.destination;
            comment = getComment(t.in_msg);
          } else if (t.out_msgs.length) {
            // external message, we sending grams
            from_addr = t.out_msgs[0].source;
            to_addr = t.out_msgs[0].destination;
            comment = getComment(t.out_msgs[0]);
            //TODO support many out messages. We need to show separate outgoing payment for each? How to show fees?
          } else ;

          if (to_addr) {
            arr.push({
              amount: amount.toString(),
              from_addr: from_addr,
              to_addr: to_addr,
              fee: t.fee.toString(),
              storageFee: t.storage_fee.toString(),
              otherFee: t.other_fee.toString(),
              comment: comment,
              date: t.utime * 1000,
            });
          }
        }
        return arr;
      }

      /**
       * @param toAddress {String}  Destination address in any format
       * @param amount    {BN}  Transfer value in nanograms
       * @param comment   {String}  Transfer comment
       * @param keyPair    nacl.KeyPair
       * @param stateInit? {Cell}
       * @return Promise<{send: Function, estimateFee: Function}>
       */
      async sign(toAddress, amount, comment, keyPair, stateInit) {
        const wallet = await this.getWallet(this.myAddress);
        let seqno = wallet.seqno;
        if (!seqno) seqno = 0;

        const secretKey = keyPair ? keyPair.secretKey : null;
        return this.walletContract.methods.transfer({
          secretKey: secretKey,
          toAddress: toAddress,
          amount: amount,
          seqno: seqno,
          payload: comment,
          sendMode: 3,
          stateInit,
        });
      }

      // CREATE WALLET

      async showCreated() {
        this.sendToView('showScreen', { name: 'created' });
        this.sendToView('disableCreated', true);
        this.myMnemonicWords = await TonWeb.mnemonic.generateMnemonic();
        const privateKey = await Controller.wordsToPrivateKey(this.myMnemonicWords);
        const keyPair = nacl.sign.keyPair.fromSeed(
          TonWeb.utils.base64ToBytes(privateKey)
        );
        const walletVersion = DEFAULT_WALLET_VERSION;
        const WalletClass = this.ton.wallet.all[walletVersion];
        this.walletContract = new WalletClass(this.ton.provider, {
          publicKey: keyPair.publicKey,
          wc: 0,
        });
        this.myAddress = (await this.walletContract.getAddress()).toString(
          true,
          true,
          true
        );
        this.publicKeyHex = TonWeb.utils.bytesToHex(keyPair.publicKey);
        await storage.setItem('publicKey', this.publicKeyHex);
        await storage.setItem('walletVersion', walletVersion);
        this.sendToView('disableCreated', false);
      }

      async createPrivateKey() {
        this.showBackup(this.myMnemonicWords, true);
      }

      // BACKUP WALLET

      onBackupWalletClick() {
        this.afterEnterPassword = async (mnemonicWords) => {
          this.showBackup(mnemonicWords);
        };
        this.sendToView('showPopup', { name: 'enterPassword' });
      }

      showBackup(words, isFirst) {
        this.sendToView('showScreen', { name: 'backup', words, isFirst });
      }

      async onBackupDone() {
        if (await storage.getItem('words')) {
          this.sendToView('showScreen', { name: 'main' });
        } else {
          this.sendToView('showScreen', {
            name: 'wordsConfirm',
            words: this.myMnemonicWords,
          });
        }
      }

      onConfirmDone(words) {
        if (words) {
          let isValid = true;

          Object.keys(words).forEach((index) => {
            if (this.myMnemonicWords[index] !== words[index]) {
              isValid = false;
            }
          });

          if (!isValid) {
            return;
          }

          this.showCreatePassword();
        }
      }

      // IMPORT LEDGER

      async createLedger(transportType) {
        let transport;

        switch (transportType) {
          case 'hid':
            transport = await TonWeb.ledger.TransportWebHID.create();
            break;
          case 'ble':
            transport = await TonWeb.ledger.BluetoothTransport.create();
            break;
          default:
            throw new Error('unknown transportType' + transportType);
        }

        transport.setDebugMode(true);
        this.isLedger = true;
        this.ledgerApp = new TonWeb.ledger.AppTon(transport, this.ton);
        const ledgerVersion = (await this.ledgerApp.getAppConfiguration()).version;
        this.debug('ledgerAppConfig=', ledgerVersion);
        if (!ledgerVersion.startsWith('2')) {
          alert(
            'Please update your Ledger TON-app to v2.0.1 or upper or use old wallet version https://tonwallet.me/prev/'
          );
          throw new Error('outdated ledger ton-app version');
        }
        const { publicKey } = await this.ledgerApp.getPublicKey(
          ACCOUNT_NUMBER,
          false
        ); // todo: можно сохранять publicKey и не запрашивать это

        const WalletClass = this.ton.wallet.all[DEFAULT_LEDGER_WALLET_VERSION];
        const wallet = new WalletClass(this.ton.provider, {
          publicKey: publicKey,
          wc: 0,
        });
        this.walletContract = wallet;

        const address = await wallet.getAddress();
        this.myAddress = address.toString(true, true, true);
        this.publicKeyHex = TonWeb.utils.bytesToHex(publicKey);
      }

      async importLedger(transportType) {
        await this.createLedger(transportType);
        await storage.setItem('walletVersion', this.walletContract.getName());
        await storage.setItem('address', this.myAddress);
        await storage.setItem('isLedger', 'true');
        await storage.setItem('ledgerTransportType', transportType);
        await storage.setItem('words', 'ledger');
        await storage.setItem('publicKey', this.publicKeyHex);
        this.sendToView('setIsLedger', this.isLedger);
        this.sendToView('showScreen', { name: 'readyToGo' });
      }

      // IMPORT WALLET

      showImport() {
        this.sendToView('showScreen', { name: 'import' });
      }

      async import(words) {
        this.myMnemonicWords = words;
        if (this.myMnemonicWords) {
          try {
            const privateKey = await Controller.wordsToPrivateKey(
              this.myMnemonicWords
            );
            const keyPair = nacl.sign.keyPair.fromSeed(
              TonWeb.utils.base64ToBytes(privateKey)
            );

            let hasBalance = [];

            for (let WalletClass of this.ton.wallet.list) {
              const wallet = new WalletClass(this.ton.provider, {
                publicKey: keyPair.publicKey,
                wc: 0,
              });
              const walletAddress = (await wallet.getAddress()).toString(
                true,
                true,
                true
              );
              const walletInfo = await this.ton.provider.getWalletInfo(
                walletAddress
              );
              const walletBalance = this.getBalance(walletInfo);
              if (walletBalance.gt(new BN(0))) {
                hasBalance.push({ balance: walletBalance, clazz: WalletClass });
              }
              this.debug(
                wallet.getName(),
                walletAddress,
                walletInfo,
                walletBalance.toString()
              );
            }

            let walletClass = this.ton.wallet.all[DEFAULT_WALLET_VERSION];

            if (hasBalance.length > 0) {
              hasBalance.sort((a, b) => {
                return a.balance.cmp(b.balance);
              });
              walletClass = hasBalance[hasBalance.length - 1].clazz;
            }

            await this.importImpl(keyPair, walletClass);

            this.sendToView('importCompleted', { state: 'success' });
          } catch (e) {
            this.debug(e);
            this.sendToView('importCompleted', { state: 'failure' });
          }
        } else {
          this.sendToView('importCompleted', { state: 'failure' });
        }
      }

      async importImpl(keyPair, WalletClass) {
        this.walletContract = new WalletClass(this.ton.provider, {
          publicKey: keyPair.publicKey,
          wc: 0,
        });
        this.myAddress = (await this.walletContract.getAddress()).toString(
          true,
          true,
          true
        );
        this.publicKeyHex = TonWeb.utils.bytesToHex(keyPair.publicKey);
        await storage.setItem('publicKey', this.publicKeyHex);
        await storage.setItem('walletVersion', this.walletContract.getName());
        this.showCreatePassword();
      }

      // PASSWORD

      showCreatePassword() {
        this.sendToView('showScreen', { name: 'createPassword' });
      }

      async savePrivateKey(password) {
        this.isLedger = false;
        await storage.setItem('isLedger', 'false');
        await storage.setItem('address', this.myAddress);
        await Controller.saveWords(this.myMnemonicWords, password);
        this.myMnemonicWords = null;

        this.sendToView('setIsLedger', this.isLedger);
        this.sendToView('showScreen', { name: 'readyToGo' });
        this.sendToView('privateKeySaved');
      }

      async onChangePassword(oldPassword, newPassword) {
        let words;
        try {
          words = await Controller.loadWords(oldPassword);
        } catch (e) {
          this.sendToView('showChangePasswordError');
          return;
        }
        await Controller.saveWords(words, newPassword);

        this.sendToView('closePopup');
        this.sendToView('passwordChanged');
      }

      async onEnterPassword(password) {
        let words;
        try {
          words = await Controller.loadWords(password);
        } catch (e) {
          this.sendToView('showEnterPasswordError');
          return;
        }

        this.afterEnterPassword(words);
        this.sendToView('passwordEntered');
      }

      // MAIN

      async showMain() {
        this.sendToView('showScreen', { name: 'main', myAddress: this.myAddress });
        if (!this.walletContract) {
          const walletVersion = await storage.getItem('walletVersion');
          const walletClass = walletVersion
            ? this.ton.wallet.all[walletVersion]
            : this.ton.wallet.default;

          this.walletContract = new walletClass(this.ton.provider, {
            address: this.myAddress,
            publicKey: this.publicKeyHex
              ? TonWeb.utils.hexToBytes(this.publicKeyHex)
              : undefined,
            wc: 0,
          });
        }
        this.updateIntervalId = setInterval(() => this.update(), 5000);
        this.update(true);
        this.sendToDapp('ton_accounts', [this.myAddress]);
      }

      async initDapp() {
        this.sendToDapp('ton_accounts', this.myAddress ? [this.myAddress] : []);
        this.doMagic((await storage.getItem('magic')) === 'true');
        this.doProxy((await storage.getItem('proxy')) === 'true');
      }

      async initView() {
        if (!this.myAddress || !(await storage.getItem('words'))) {
          this.sendToView('showScreen', { name: 'start', noAnimation: true });
        } else {
          this.sendToView('showScreen', {
            name: 'main',
            myAddress: this.myAddress,
          });
          if (this.balance !== null) {
            this.sendToView('setBalance', {
              balance: this.balance.toString(),
              txs: this.transactions,
            });
          }
        }
        this.sendToView('setIsMagic', (await storage.getItem('magic')) === 'true');
        this.sendToView('setIsProxy', (await storage.getItem('proxy')) === 'true');
        this.sendToView('setIsTestnet', this.isTestnet);
      }

      async update(force) {
        // if (!document.hasFocus()) {
        //     return;
        // }
        const needUpdate =
          (this.processingVisible && this.sendingData) ||
          this.balance === null ||
          force;

        if (!needUpdate) return;

        const response = await this.getWallet();

        const balance = this.getBalance(response);
        const isBalanceChanged =
          this.balance === null || this.balance.cmp(balance) !== 0;
        this.balance = balance;

        const isContractInitialized =
          this.checkContractInitialized(response) && response.seqno;
        this.debug('isBalanceChanged', isBalanceChanged);
        this.debug('isContractInitialized', isContractInitialized);

        if (!this.isContractInitialized && isContractInitialized) {
          this.isContractInitialized = true;
        }

        if (isBalanceChanged) {
          this.getTransactions().then((txs) => {
            if (txs.length > 0) {
              this.transactions = txs;
              const newTxs = txs.filter(
                (tx) => Number(tx.date) > this.lastTransactionTime
              );
              this.lastTransactionTime = Number(txs[0].date);

              if (this.processingVisible && this.sendingData) {
                for (let tx of newTxs) {
                  const txAddr = new Address(tx.to_addr).toString(true, true, true);
                  const myAddr = new Address(this.sendingData.toAddress).toString(
                    true,
                    true,
                    true
                  );
                  const txAmount = tx.amount;
                  const myAmount = '-' + this.sendingData.amount.toString();

                  if (txAddr === myAddr && txAmount === myAmount) {
                    this.sendToView('showPopup', {
                      name: 'done',
                      message:
                        formatNanograms(this.sendingData.amount) +
                        ' TON have been sent',
                    });
                    this.processingVisible = false;
                    this.sendingData = null;
                    break;
                  }
                }
              }
            }

            this.sendToView('setBalance', { balance: balance.toString(), txs });
          });
        } else {
          this.sendToView('setBalance', {
            balance: balance.toString(),
            txs: this.transactions,
          });
        }
      }

      async showAddressOnDevice() {
        if (!this.ledgerApp) {
          await this.createLedger(
            (await storage.getItem('ledgerTransportType')) || 'hid'
          );
        }
        const { address } = await this.ledgerApp.getAddress(
          ACCOUNT_NUMBER,
          true,
          this.ledgerApp.ADDRESS_FORMAT_USER_FRIENDLY +
            this.ledgerApp.ADDRESS_FORMAT_URL_SAFE +
            this.ledgerApp.ADDRESS_FORMAT_BOUNCEABLE
        );
        this.debug(address.toString(true, true, true));
      }

      // SEND GRAMS

      /**
       * @param amount    {BN}    in nanograms
       * @param toAddress {string}
       * @param comment?  {string}
       * @param stateInit? {Cell}
       * @return {Promise<BN>} in nanograms
       */
      async getFees(amount, toAddress, comment, stateInit) {
        if (!this.isContractInitialized && !this.publicKeyHex) {
          return TonWeb.utils.toNano('0.010966001');
        }

        const query = await this.sign(toAddress, amount, comment, null, stateInit);
        const all_fees = await query.estimateFee();
        const fees = all_fees.source_fees;
        const in_fwd_fee = new BN(fees.in_fwd_fee);
        const storage_fee = new BN(fees.storage_fee);
        const gas_fee = new BN(fees.gas_fee);
        const fwd_fee = new BN(fees.fwd_fee);

        // const tooltip_text = '<span>External processing fee ' + (fees.in_fwd_fee / 1e9).toString() + ' grams</span></br>' +
        //     '<span>Storage fee ' + (fees.storage_fee / 1e9).toString() + ' grams</span></br>' +
        //     '<span>Gas fee ' + (fees.gas_fee / 1e9).toString() + ' grams</span></br>' +
        //     '<span>Forwarding fees ' + (fees.fwd_fee / 1e9).toString() + ' grams</span>';
        //
        return in_fwd_fee.add(storage_fee).add(gas_fee).add(fwd_fee);
      }

      /**
       * @param amount    {BN} in nanotons
       * @param toAddress {string}
       * @param comment?  {string | Uint8Array}
       * @param needQueue? {boolean}
       * @param stateInit? {Cell}
       */
      async showSendConfirm(amount, toAddress, comment, needQueue, stateInit) {
        createDappPromise();

        if (!amount.gt(new BN(0))) {
          this.sendToView('sendCheckFailed', { message: 'Invalid amount' });
          return false;
        }

        if (!Address.isValid(toAddress)) {
          try {
            toAddress = toAddress.toLowerCase();
            if (this.isTestnet && toAddress.endsWith('.ton')) {
              toAddress = await this.ton.dns.getWalletAddress(toAddress);
              if (!toAddress) {
                throw new Error();
              }
              if (!Address.isValid(toAddress)) {
                throw new Error();
              }
              toAddress = toAddress.toString(true, true, true);
            }
          } catch (e) {
            this.sendToView('sendCheckFailed', {
              message: 'Invalid address or domain',
            });
            return false;
          }
        }

        try {
          await this.update(true);
        } catch {
          this.sendToView('sendCheckFailed', { message: 'API request error' });
          return false;
        }

        if (this.balance.lt(amount)) {
          this.sendToView('sendCheckFailed', {
            message: 'Not enough balance',
          });
          return false;
        }

        let fee;

        try {
          fee = await this.getFees(amount, toAddress, comment, stateInit);
        } catch {
          this.sendToView('sendCheckFailed', { message: 'API request error' });
          return false;
        }

        if (this.balance.sub(fee).lt(amount)) {
          this.sendToView('sendCheckCantPayFee', { fee });
          return false;
        }

        if (this.isLedger) {
          this.sendToView(
            'showPopup',
            {
              name: 'sendConfirm',
              amount: amount.toString(),
              toAddress: toAddress,
              fee: fee.toString(),
            },
            needQueue
          );

          const sendResult = await this.send(
            toAddress,
            amount,
            comment,
            null,
            stateInit
          );

          if (sendResult) {
            dAppPromise.resolve(true);
          } else {
            this.sendToView('sendCheckFailed', { message: 'API request error' });
            dAppPromise.resolve(false);
          }
        } else {
          this.afterEnterPassword = async (words) => {
            this.processingVisible = true;
            this.sendToView('showPopup', { name: 'processing' });
            const privateKey = await Controller.wordsToPrivateKey(words);

            const sendResult = await this.send(
              toAddress,
              amount,
              comment,
              privateKey,
              stateInit
            );

            if (sendResult) {
              dAppPromise.resolve(true);
            } else {
              this.sendToView('sendCheckFailed', { message: 'API request error' });
              dAppPromise.resolve(false);
            }
          };

          this.onCancelAction = () => {
            dAppPromise.resolve(false);
          };

          this.sendToView(
            'showPopup',
            {
              name: 'sendConfirm',
              amount: amount.toString(),
              toAddress: toAddress,
              fee: fee.toString(),
            },
            needQueue
          );
        }

        this.sendToView('sendCheckSucceeded');

        return dAppPromise || false;
      }

      /**
       * @param hexToSign  {string} hex data to sign
       * @param needQueue {boolean}
       * @returns {Promise<string>} signature in hex
       */
      showSignConfirm(hexToSign, needQueue) {
        return new Promise((resolve, reject) => {
          if (this.isLedger) {
            alert('sign not supported by Ledger');
            reject();
          } else {
            this.afterEnterPassword = async (words) => {
              this.sendToView('closePopup');
              const privateKey = await Controller.wordsToPrivateKey(words);
              const signature = this.rawSign(hexToSign, privateKey);
              resolve(signature);
            };

            this.sendToView(
              'showPopup',
              {
                name: 'signConfirm',
                data: hexToSign,
              },
              needQueue
            );
          }
        });
      }

      /**
       * @param toAddress {string}
       * @param amount    {BN} in nanograms
       * @param comment   {string}
       * @param privateKey    {string}
       * @param stateInit? {Cell}
       * @return  {Promise<boolean>}
       */
      async send(toAddress, amount, comment, privateKey, stateInit) {
        try {
          let addressFormat = 0;
          if (this.isLedger) {
            if (stateInit) {
              throw new Error('stateInit dont supported by Ledger');
            }

            if (!this.ledgerApp) {
              await this.createLedger(
                (await storage.getItem('ledgerTransportType')) || 'hid'
              );
            }

            const toAddress_ = new Address(toAddress);
            if (toAddress_.isUserFriendly) {
              addressFormat += this.ledgerApp.ADDRESS_FORMAT_USER_FRIENDLY;
              if (toAddress_.isUrlSafe) {
                addressFormat += this.ledgerApp.ADDRESS_FORMAT_URL_SAFE;
              }
              if (toAddress_.isBounceable) {
                addressFormat += this.ledgerApp.ADDRESS_FORMAT_BOUNCEABLE;
              }
              if (toAddress_.isTestOnly) {
                addressFormat += this.ledgerApp.ADDRESS_FORMAT_TEST_ONLY;
              }
            }
          }

          if (
            !this.checkContractInitialized(
              await this.ton.provider.getWalletInfo(toAddress)
            )
          ) {
            toAddress = new Address(toAddress).toString(true, true, false);
          }

          if (this.isLedger) {
            const wallet = await this.getWallet(this.myAddress);
            let seqno = wallet.seqno;
            if (!seqno) seqno = 0;

            const query = await this.ledgerApp.transfer(
              ACCOUNT_NUMBER,
              this.walletContract,
              toAddress,
              amount,
              seqno,
              addressFormat
            );
            this.sendingData = {
              toAddress: toAddress,
              amount: amount,
              comment: comment,
              query: query,
            };

            this.sendToView('showPopup', { name: 'processing' });
            this.processingVisible = true;

            return await this.sendQuery(query);
          } else {
            const keyPair = nacl.sign.keyPair.fromSeed(
              TonWeb.utils.base64ToBytes(privateKey)
            );
            const query = await this.sign(
              toAddress,
              amount,
              comment,
              keyPair,
              stateInit
            );
            this.sendingData = {
              toAddress: toAddress,
              amount: amount,
              comment: comment,
              query: query,
            };
            return await this.sendQuery(query);
          }
        } catch (e) {
          this.debug(e);
          this.sendToView('closePopup');
          alert('Error sending');
          return false;
        }
      }

      /**
       * @param hex   {string} hex to sign
       * @param privateKey    {string}
       * @returns {Promise<string>} signature in hex
       */
      rawSign(hex, privateKey) {
        const keyPair = nacl.sign.keyPair.fromSeed(
          TonWeb.utils.base64ToBytes(privateKey)
        );
        const signature = nacl.sign.detached(
          TonWeb.utils.hexToBytes(hex),
          keyPair.secretKey
        );
        return TonWeb.utils.bytesToHex(signature);
      }

      /**
       * @param query - return by sign()
       * @return {Promise<boolean>}
       */
      async sendQuery(query) {
        const sendResponse = await query.send();
        if (sendResponse['@type'] === 'ok') {
          // wait for transaction, then show Done popup
          return true;
        } else {
          this.sendToView('closePopup');
          alert('Send error');
          return false;
        }
      }

      // DISCONNECT WALLET

      clearVars() {
        this.myAddress = null;
        this.publicKeyHex = null;
        this.balance = null;
        this.walletContract = null;
        this.transactions = [];
        this.lastTransactionTime = 0;
        this.isContractInitialized = false;
        this.sendingData = null;
        this.processingVisible = false;
        this.isLedger = false;
        this.ledgerApp = null;
        clearInterval(this.updateIntervalId);
      }

      async onDisconnectClick() {
        this.clearVars();
        await storage.clear();
        this.sendToView('showScreen', { name: 'start' });
        this.sendToDapp('ton_accounts', []);
      }

      // MAGIC

      doMagic(enabled) {
        try {
          this.sendToDapp('ton_doMagic', enabled);
        } catch (e) {}
      }

      // PROXY

      doProxy(enabled) {}

      // TRANSPORT WITH VIEW

      sendToView(method, params, needQueue, needResult) {
        if (self.view) {
          const result = self.view.onMessage(method, params);
          if (needResult) {
            return result;
          }
        } else {
          const msg = { method, params };
          const exec = () => {
            if (popupPort) {
              popupPort.postMessage(msg);
            } else if (needQueue) {
              queueToPopup.push(msg);
            }
          };

          if (!needResult) {
            exec();
            return;
          }

          return new Promise((resolve) => {
            msg.id = this._lastMsgId++;
            this.pendingMessageResolvers.set(msg.id, resolve);
            exec();
          });
        }
      }

      async onViewMessage(method, params) {
        switch (method) {
          case 'showScreen':
            switch (params.name) {
              case 'created':
                await this.showCreated();
                break;
              case 'import':
                this.showImport();
                break;
              case 'importLedger':
                await this.importLedger(params.transportType);
                break;
            }
            break;
          case 'import':
            await this.import(params.words);
            break;
          case 'createPrivateKey':
            await this.createPrivateKey();
            break;
          case 'passwordCreated':
            await this.savePrivateKey(params.password);
            break;
          case 'update':
            this.update(true);
            break;
          case 'showAddressOnDevice':
            await this.showAddressOnDevice();
            break;
          case 'onCancelAction':
            if (this.onCancelAction) {
              await this.onCancelAction();
              this.onCancelAction = null;
            }
            break;
          case 'onEnterPassword':
            await this.onEnterPassword(params.password);
            break;
          case 'onChangePassword':
            await this.onChangePassword(params.oldPassword, params.newPassword);
            break;
          case 'onSend':
            await this.showSendConfirm(
              new BN(params.amount),
              params.toAddress,
              params.comment
            );
            break;
          case 'onBackupDone':
            await this.onBackupDone();
            break;
          case 'onConfirmBack':
            this.showBackup(this.myMnemonicWords);
            break;
          case 'onImportBack':
            this.sendToView('showScreen', { name: 'start' });
            break;
          case 'onConfirmDone':
            this.onConfirmDone(params.words);
            break;
          case 'showMain':
            await this.showMain();
            break;
          case 'onBackupWalletClick':
            this.onBackupWalletClick();
            break;
          case 'disconnect':
            await this.onDisconnectClick();
            break;
          case 'onClosePopup':
            this.processingVisible = false;
            break;
          case 'onMagicClick':
            await storage.setItem('magic', params ? 'true' : 'false');
            this.doMagic(params);
            break;
          case 'onProxyClick':
            await storage.setItem('proxy', params ? 'true' : 'false');
            this.doProxy(params);
            break;
          case 'toggleTestnet':
            await this.toggleTestnet();
            break;
          case 'toggleDebug':
            await this.toggleDebug();
            break;
          case 'onWindowUpdate':
            await storage.setItem('windowState', {
              top: params.top,
              left: params.left,
              // -2 need for remove frames size
              // TODO: check in linux and macos
              height: params.height - 2,
              width: params.width - 2,
            });
            break;
        }
      }

      // TRANSPORT WITH DAPP

      sendToDapp(method, params) {
        contentScriptPorts.forEach((port) => {
          port.postMessage(
            JSON.stringify({
              type: 'gramWalletAPI',
              message: { jsonrpc: '2.0', method: method, params: params },
            })
          );
        });
      }

      requestPublicKey(needQueue) {
        return new Promise(async (resolve, reject) => {
          await showExtensionWindow();

          this.afterEnterPassword = async (words) => {
            const privateKey = await Controller.wordsToPrivateKey(words);
            const keyPair = nacl.sign.keyPair.fromSeed(
              TonWeb.utils.base64ToBytes(privateKey)
            );
            this.publicKeyHex = TonWeb.utils.bytesToHex(keyPair.publicKey);
            await storage.setItem('publicKey', this.publicKeyHex);
            resolve();
          };

          this.sendToView('showPopup', { name: 'enterPassword' }, needQueue);
        });
      }

      async onDappMessage(method, params) {
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1193.md
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1102.md
        await this.whenReady;

        const needQueue = !popupPort;

        switch (method) {
          case 'ton_requestAccounts':
            return this.myAddress ? [this.myAddress] : [];
          case 'ton_requestWallets':
            if (!this.myAddress) {
              return [];
            }
            if (!this.publicKeyHex) {
              await this.requestPublicKey(needQueue);
            }
            const walletVersion = await storage.getItem('walletVersion');
            return [
              {
                address: this.myAddress,
                publicKey: this.publicKeyHex,
                walletVersion: walletVersion,
              },
            ];
          case 'ton_getBalance':
            await this.update(true);
            return this.balance ? this.balance.toString() : '';
          case 'ton_sendTransaction':
            const param = params[0];
            await showExtensionWindow();

            if (param.data) {
              if (param.dataType === 'hex') {
                param.data = TonWeb.utils.hexToBytes(param.data);
              } else if (param.dataType === 'base64') {
                param.data = TonWeb.utils.base64ToBytes(param.data);
              } else if (param.dataType === 'boc') {
                param.data = TonWeb.boc.Cell.oneFromBoc(
                  TonWeb.utils.base64ToBytes(param.data)
                );
              }
            }
            if (param.stateInit) {
              param.stateInit = TonWeb.boc.Cell.oneFromBoc(
                TonWeb.utils.base64ToBytes(param.stateInit)
              );
            }

            this.sendToView('showPopup', {
              name: 'loader',
            });

            const result = await this.showSendConfirm(
              new BN(param.value),
              param.to,
              param.data,
              needQueue,
              param.stateInit
            );
            if (!result) {
              this.sendToView('closePopup');
            }
            return result;
          case 'ton_rawSign':
            const signParam = params[0];
            await showExtensionWindow();

            return this.showSignConfirm(signParam.data, needQueue);
          case 'flushMemoryCache':
            await chrome.webRequest.handlerBehaviorChanged();
            return true;
        }
      }
    }

    const controller = new Controller();

    if (IS_EXTENSION) {
      chrome.runtime.onConnect.addListener((port) => {
        if (port.name === 'gramWalletContentScript') {
          contentScriptPorts.add(port);
          port.onMessage.addListener(async (msg, port) => {
            if (msg.type === 'gramWalletAPI_ton_provider_connect') {
              controller.whenReady.then(() => {
                controller.initDapp();
              });
            }

            if (!msg.message) return;

            const result = await controller.onDappMessage(
              msg.message.method,
              msg.message.params
            );
            if (port) {
              port.postMessage(
                JSON.stringify({
                  type: 'gramWalletAPI',
                  message: {
                    jsonrpc: '2.0',
                    id: msg.message.id,
                    method: msg.message.method,
                    result,
                  },
                })
              );
            }
          });
          port.onDisconnect.addListener((port) => {
            contentScriptPorts.delete(port);
          });
        } else if (port.name === 'gramWalletPopup') {
          popupPort = port;
          popupPort.onMessage.addListener(function (msg) {
            if (msg.method === 'response') {
              const resolver = controller.pendingMessageResolvers.get(msg.id);
              if (resolver) {
                resolver(msg.result);
                controller.pendingMessageResolvers.delete(msg.id);
              }
            } else {
              controller.onViewMessage(msg.method, msg.params);
            }
          });
          popupPort.onDisconnect.addListener(() => {
            popupPort = null;
          });

          const runQueueToPopup = () => {
            queueToPopup.forEach((msg) => popupPort.postMessage(msg));
            queueToPopup.length = 0;
          };

          if (!controller.myAddress) {
            // if controller not initialized yet
            runQueueToPopup();
          }

          controller.whenReady.then(async () => {
            await controller.initView();
            runQueueToPopup();
          });
        }
      });

      let actionApiName = 'action';
      if (chrome.runtime.getManifest().manifest_version === 2)
        actionApiName = 'browserAction';

      chrome[actionApiName].onClicked.addListener(showExtensionWindow);

      chrome.windows.onRemoved.addListener((removedWindowId) => {
        if (dAppPromise) dAppPromise.resolve(false);

        if (removedWindowId !== extensionWindowId) return;
        extensionWindowId = -1;
      });
    }

    /* src/App.svelte generated by Svelte v3.48.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    // (22:4) {#if myMnemonicWords.length}
    function create_if_block(ctx) {
    	let div;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(/*myMnemonicWords*/ ctx[0]);
    			attr_dev(div, "class", "words svelte-1qfw3hd");
    			add_location(div, file, 22, 6, 597);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*myMnemonicWords*/ 1) set_data_dev(t, /*myMnemonicWords*/ ctx[0]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(22:4) {#if myMnemonicWords.length}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let h20;
    	let t1;
    	let t2;
    	let button0;
    	let button1;
    	let t5;
    	let h21;
    	let t7;
    	let input;
    	let mounted;
    	let dispose;
    	let if_block = /*myMnemonicWords*/ ctx[0].length && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			h20 = element("h2");
    			h20.textContent = "Create or import wallet";
    			t1 = space();
    			if (if_block) if_block.c();
    			t2 = space();
    			button0 = element("button");
    			button0.textContent = "Create";
    			button1 = element("button");
    			button1.textContent = "Import";
    			t5 = space();
    			h21 = element("h2");
    			h21.textContent = "Enter Password";
    			t7 = space();
    			input = element("input");
    			add_location(h20, file, 19, 4, 524);
    			add_location(button0, file, 24, 4, 654);
    			add_location(button1, file, 24, 52, 702);
    			attr_dev(div, "class", "svelte-1qfw3hd");
    			add_location(div, file, 18, 2, 514);
    			add_location(h21, file, 26, 2, 737);
    			add_location(input, file, 27, 2, 763);
    			attr_dev(main, "class", "svelte-1qfw3hd");
    			add_location(main, file, 17, 0, 505);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, h20);
    			append_dev(div, t1);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t2);
    			append_dev(div, button0);
    			append_dev(div, button1);
    			append_dev(main, t5);
    			append_dev(main, h21);
    			append_dev(main, t7);
    			append_dev(main, input);
    			set_input_value(input, /*password*/ ctx[1]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*onCreateClick*/ ctx[2], false, false, false),
    					listen_dev(input, "change", /*change_handler*/ ctx[4], false, false, false),
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5])
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*myMnemonicWords*/ ctx[0].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div, t2);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*password*/ 2 && input.value !== /*password*/ ctx[1]) {
    				set_input_value(input, /*password*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { name } = $$props;
    	let myMnemonicWords = [];
    	let password = '';
    	const TonWeb = window.TonWeb;

    	const onCreateClick = async () => {
    		$$invalidate(0, myMnemonicWords = await TonWeb.mnemonic.generateMnemonic());
    		console.log(myMnemonicWords);
    		Controller.saveWords(myMnemonicWords, password);
    		console.log(password);
    	};

    	onMount(async () => {
    		$$invalidate(0, myMnemonicWords = await Controller.loadWords(password));
    	});

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const change_handler = async e => {
    		console.log(e);
    		console.log(password);
    		$$invalidate(0, myMnemonicWords = await Controller.loadWords(password));
    	};

    	function input_input_handler() {
    		password = this.value;
    		$$invalidate(1, password);
    	}

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Controller,
    		name,
    		myMnemonicWords,
    		password,
    		TonWeb,
    		onCreateClick
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(3, name = $$props.name);
    		if ('myMnemonicWords' in $$props) $$invalidate(0, myMnemonicWords = $$props.myMnemonicWords);
    		if ('password' in $$props) $$invalidate(1, password = $$props.password);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		myMnemonicWords,
    		password,
    		onCreateClick,
    		name,
    		change_handler,
    		input_input_handler
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*name*/ ctx[3] === undefined && !('name' in props)) {
    			console_1.warn("<App> was created without expected prop 'name'");
    		}
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
        props: {
            name: 'world',
        },
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
