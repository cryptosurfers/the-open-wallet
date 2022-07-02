
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
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
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function get_all_dirty_from_scope($$scope) {
        if ($$scope.ctx.length > 32) {
            const dirty = [];
            const length = $$scope.ctx.length / 32;
            for (let i = 0; i < length; i++) {
                dirty[i] = -1;
            }
            return dirty;
        }
        return -1;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_slots(slots) {
        const result = {};
        for (const key in slots) {
            result[key] = true;
        }
        return result;
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
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
    function empty() {
        return text('');
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
    function set_data(text, data) {
        data = '' + data;
        if (text.wholeText !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
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
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
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
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
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

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
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

    const reductId = (x) => x?.match(/^.{6}|.{4}$/g)?.join('...');
    const setClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    /* src/components/Button.svelte generated by Svelte v3.48.0 */

    function create_fragment$5(ctx) {
    	let button;
    	let span;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[10].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[9], null);

    	return {
    		c() {
    			button = element("button");
    			span = element("span");
    			if (default_slot) default_slot.c();
    			attr(button, "class", button_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-j3krw6"));
    			set_style(button, "width", /*wide*/ ctx[1] ? '' : /*width*/ ctx[0]);
    			attr(button, "type", "button");
    		},
    		m(target, anchor) {
    			insert(target, button, anchor);
    			append(button, span);

    			if (default_slot) {
    				default_slot.m(span, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen(button, "click", /*click_handler*/ ctx[11]),
    					listen(button, "keypress", /*keypress_handler*/ ctx[12])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 512)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[9],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[9])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[9], dirty, null),
    						null
    					);
    				}
    			}

    			if (!current || dirty & /*classes*/ 4 && button_class_value !== (button_class_value = "" + (null_to_empty(/*classes*/ ctx[2]) + " svelte-j3krw6"))) {
    				attr(button, "class", button_class_value);
    			}

    			if (!current || dirty & /*wide, width*/ 3) {
    				set_style(button, "width", /*wide*/ ctx[1] ? '' : /*width*/ ctx[0]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { size = 'lg' } = $$props;
    	let { type = 'default' } = $$props;
    	let { icon = '' } = $$props;
    	let { label = '' } = $$props;
    	let { width = '' } = $$props;
    	let { wide = false } = $$props;
    	let { loading = false } = $$props;
    	let { disabled = false } = $$props;
    	let className = $$props.class || $$props.className || '';
    	let classes;

    	function click_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(14, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('size' in $$new_props) $$invalidate(3, size = $$new_props.size);
    		if ('type' in $$new_props) $$invalidate(4, type = $$new_props.type);
    		if ('icon' in $$new_props) $$invalidate(5, icon = $$new_props.icon);
    		if ('label' in $$new_props) $$invalidate(6, label = $$new_props.label);
    		if ('width' in $$new_props) $$invalidate(0, width = $$new_props.width);
    		if ('wide' in $$new_props) $$invalidate(1, wide = $$new_props.wide);
    		if ('loading' in $$new_props) $$invalidate(7, loading = $$new_props.loading);
    		if ('disabled' in $$new_props) $$invalidate(8, disabled = $$new_props.disabled);
    		if ('$$scope' in $$new_props) $$invalidate(9, $$scope = $$new_props.$$scope);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*type, size, wide, loading, disabled*/ 410) {
    			$$invalidate(2, classes = [
    				type,
    				size,
    				className,
    				wide && 'wide',
    				loading && 'loading',
    				disabled && 'disabled'
    			].filter(v => v).join(' '));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		width,
    		wide,
    		classes,
    		size,
    		type,
    		icon,
    		label,
    		loading,
    		disabled,
    		$$scope,
    		slots,
    		click_handler,
    		keypress_handler
    	];
    }

    class Button extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {
    			size: 3,
    			type: 4,
    			icon: 5,
    			label: 6,
    			width: 0,
    			wide: 1,
    			loading: 7,
    			disabled: 8
    		});
    	}
    }

    /* src/components/Input.svelte generated by Svelte v3.48.0 */

    function create_fragment$4(ctx) {
    	let div1;
    	let div0;
    	let input;
    	let div1_class_value;
    	let mounted;
    	let dispose;

    	return {
    		c() {
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			attr(input, "type", "text");
    			attr(input, "name", /*name*/ ctx[8]);
    			attr(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.readOnly = /*readonly*/ ctx[2];
    			input.disabled = /*disabled*/ ctx[3];
    			attr(input, "autocomplete", "off");
    			attr(input, "class", "svelte-1t38hh3");
    			attr(div0, "class", "inp svelte-1t38hh3");
    			attr(div1, "class", div1_class_value = "" + (null_to_empty(/*classes*/ ctx[9]) + " svelte-1t38hh3"));
    			attr(div1, "style", /*style*/ ctx[6]);
    			toggle_class(div1, "error", /*error*/ ctx[7]);
    			toggle_class(div1, "success", /*success*/ ctx[5]);
    			toggle_class(div1, "readonly", /*readonly*/ ctx[2]);
    			toggle_class(div1, "disabled", /*disabled*/ ctx[3]);
    		},
    		m(target, anchor) {
    			insert(target, div1, anchor);
    			append(div1, div0);
    			append(div0, input);
    			/*input_binding*/ ctx[27](input);
    			set_input_value(input, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen(input, "input", /*input_input_handler*/ ctx[28]),
    					listen(input, "focus", /*onFocus*/ ctx[10]),
    					listen(input, "blur", /*onBlur*/ ctx[11]),
    					listen(input, "input", /*onInput*/ ctx[12]),
    					listen(input, "focus", /*focus_handler*/ ctx[20]),
    					listen(input, "blur", /*blur_handler*/ ctx[21]),
    					listen(input, "input", /*input_handler*/ ctx[22]),
    					listen(input, "change", /*change_handler*/ ctx[23]),
    					listen(input, "keypress", /*keypress_handler*/ ctx[24]),
    					listen(input, "keydown", /*keydown_handler*/ ctx[25]),
    					listen(input, "keyup", /*keyup_handler*/ ctx[26])
    				];

    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*name*/ 256) {
    				attr(input, "name", /*name*/ ctx[8]);
    			}

    			if (dirty[0] & /*placeholder*/ 16) {
    				attr(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty[0] & /*readonly*/ 4) {
    				input.readOnly = /*readonly*/ ctx[2];
    			}

    			if (dirty[0] & /*disabled*/ 8) {
    				input.disabled = /*disabled*/ ctx[3];
    			}

    			if (dirty[0] & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}

    			if (dirty[0] & /*classes*/ 512 && div1_class_value !== (div1_class_value = "" + (null_to_empty(/*classes*/ ctx[9]) + " svelte-1t38hh3"))) {
    				attr(div1, "class", div1_class_value);
    			}

    			if (dirty[0] & /*style*/ 64) {
    				attr(div1, "style", /*style*/ ctx[6]);
    			}

    			if (dirty[0] & /*classes, error*/ 640) {
    				toggle_class(div1, "error", /*error*/ ctx[7]);
    			}

    			if (dirty[0] & /*classes, success*/ 544) {
    				toggle_class(div1, "success", /*success*/ ctx[5]);
    			}

    			if (dirty[0] & /*classes, readonly*/ 516) {
    				toggle_class(div1, "readonly", /*readonly*/ ctx[2]);
    			}

    			if (dirty[0] & /*classes, disabled*/ 520) {
    				toggle_class(div1, "disabled", /*disabled*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d(detaching) {
    			if (detaching) detach(div1);
    			/*input_binding*/ ctx[27](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let filled;
    	let { size = 'md' } = $$props;
    	let { value = '' } = $$props;
    	let { readonly = false } = $$props;
    	let { disabled = false } = $$props;
    	let { placeholder = null } = $$props;
    	let { validateOnBlur = false } = $$props;
    	let { rules = [] } = $$props;
    	let { success = false } = $$props;
    	let { style = null } = $$props;
    	let { inputElement = null } = $$props;
    	let { message = '' } = $$props;
    	let { error = '' } = $$props;
    	let { name = '' } = $$props;
    	let className = $$props.class || $$props.className || '';
    	let focused = false;
    	let errorMessages = [];
    	let hasError;
    	let classes;

    	function validate() {
    		errorMessages = rules.map(r => r(value)).filter(r => typeof r === 'string');
    		hasError = !!errorMessages.length || !!error;
    		return hasError;
    	}

    	function onFocus() {
    		$$invalidate(18, focused = true);
    	}

    	function onBlur() {
    		$$invalidate(18, focused = false);
    		if (validateOnBlur) validate();
    	}

    	function onInput() {
    		if (!validateOnBlur) validate();
    	}

    	function focus_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function blur_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keypress_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keydown_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function keyup_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputElement = $$value;
    			$$invalidate(1, inputElement);
    		});
    	}

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(32, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('size' in $$new_props) $$invalidate(13, size = $$new_props.size);
    		if ('value' in $$new_props) $$invalidate(0, value = $$new_props.value);
    		if ('readonly' in $$new_props) $$invalidate(2, readonly = $$new_props.readonly);
    		if ('disabled' in $$new_props) $$invalidate(3, disabled = $$new_props.disabled);
    		if ('placeholder' in $$new_props) $$invalidate(4, placeholder = $$new_props.placeholder);
    		if ('validateOnBlur' in $$new_props) $$invalidate(14, validateOnBlur = $$new_props.validateOnBlur);
    		if ('rules' in $$new_props) $$invalidate(15, rules = $$new_props.rules);
    		if ('success' in $$new_props) $$invalidate(5, success = $$new_props.success);
    		if ('style' in $$new_props) $$invalidate(6, style = $$new_props.style);
    		if ('inputElement' in $$new_props) $$invalidate(1, inputElement = $$new_props.inputElement);
    		if ('message' in $$new_props) $$invalidate(16, message = $$new_props.message);
    		if ('error' in $$new_props) $$invalidate(7, error = $$new_props.error);
    		if ('name' in $$new_props) $$invalidate(8, name = $$new_props.name);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*value*/ 1) {
    			$$invalidate(19, filled = !!value);
    		}

    		if ($$self.$$.dirty[0] & /*error*/ 128) {
    			hasError = !!error;
    		}

    		if ($$self.$$.dirty[0] & /*size, focused, filled*/ 794624) {
    			$$invalidate(9, classes = [className, size, focused && 'focused', filled && 'filled'].filter(v => v).join(' '));
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		value,
    		inputElement,
    		readonly,
    		disabled,
    		placeholder,
    		success,
    		style,
    		error,
    		name,
    		classes,
    		onFocus,
    		onBlur,
    		onInput,
    		size,
    		validateOnBlur,
    		rules,
    		message,
    		validate,
    		focused,
    		filled,
    		focus_handler,
    		blur_handler,
    		input_handler,
    		change_handler,
    		keypress_handler,
    		keydown_handler,
    		keyup_handler,
    		input_binding,
    		input_input_handler
    	];
    }

    class Input extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(
    			this,
    			options,
    			instance$4,
    			create_fragment$4,
    			safe_not_equal,
    			{
    				size: 13,
    				value: 0,
    				readonly: 2,
    				disabled: 3,
    				placeholder: 4,
    				validateOnBlur: 14,
    				rules: 15,
    				success: 5,
    				style: 6,
    				inputElement: 1,
    				message: 16,
    				error: 7,
    				name: 8,
    				validate: 17
    			},
    			null,
    			[-1, -1]
    		);
    	}

    	get validate() {
    		return this.$$.ctx[17];
    	}
    }

    /* node_modules/svelte-portal/src/Portal.svelte generated by Svelte v3.48.0 */

    function create_fragment$3(ctx) {
    	let div;
    	let portal_action;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	return {
    		c() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			div.hidden = true;
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(portal_action = portal.call(null, div, /*target*/ ctx[0]));
    				mounted = true;
    			}
    		},
    		p(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[1],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[1])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[1], dirty, null),
    						null
    					);
    				}
    			}

    			if (portal_action && is_function(portal_action.update) && dirty & /*target*/ 1) portal_action.update.call(null, /*target*/ ctx[0]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function portal(el, target = "body") {
    	let targetEl;

    	async function update(newTarget) {
    		target = newTarget;

    		if (typeof target === "string") {
    			targetEl = document.querySelector(target);

    			if (targetEl === null) {
    				await tick();
    				targetEl = document.querySelector(target);
    			}

    			if (targetEl === null) {
    				throw new Error(`No element found matching css selector: "${target}"`);
    			}
    		} else if (target instanceof HTMLElement) {
    			targetEl = target;
    		} else {
    			throw new TypeError(`Unknown portal target type: ${target === null ? "null" : typeof target}. Allowed types: string (CSS selector) or HTMLElement.`);
    		}

    		targetEl.appendChild(el);
    		el.hidden = false;
    	}

    	function destroy() {
    		if (el.parentNode) {
    			el.parentNode.removeChild(el);
    		}
    	}

    	update(target);
    	return { update, destroy };
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	let { target = "body" } = $$props;

    	$$self.$$set = $$props => {
    		if ('target' in $$props) $$invalidate(0, target = $$props.target);
    		if ('$$scope' in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	return [target, $$scope, slots];
    }

    class Portal extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { target: 0 });
    	}
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/components/modals/Modal.svelte generated by Svelte v3.48.0 */
    const get_controls_slot_changes = dirty => ({});
    const get_controls_slot_context = ctx => ({});
    const get_prepend_slot_changes = dirty => ({});
    const get_prepend_slot_context = ctx => ({});

    // (18:0) {#if open}
    function create_if_block$1(ctx) {
    	let portal;
    	let current;

    	portal = new Portal({
    			props: {
    				$$slots: { default: [create_default_slot$2] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(portal.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(portal, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const portal_changes = {};

    			if (dirty & /*$$scope, width, z_index, fullScreen, emptyDesc, empty, $$slots, title, close*/ 1534) {
    				portal_changes.$$scope = { dirty, ctx };
    			}

    			portal.$set(portal_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(portal.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(portal.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(portal, detaching);
    		}
    	};
    }

    // (25:10) {#if title && !empty}
    function create_if_block_2$1(ctx) {
    	let h2;
    	let t;

    	return {
    		c() {
    			h2 = element("h2");
    			t = text(/*title*/ ctx[4]);
    			attr(h2, "class", "title svelte-lupfo5");
    		},
    		m(target, anchor) {
    			insert(target, h2, anchor);
    			append(h2, t);
    		},
    		p(ctx, dirty) {
    			if (dirty & /*title*/ 16) set_data(t, /*title*/ ctx[4]);
    		},
    		d(detaching) {
    			if (detaching) detach(h2);
    		}
    	};
    }

    // (30:8) {#if $$slots.controls}
    function create_if_block_1$1(ctx) {
    	let div;
    	let current;
    	const controls_slot_template = /*#slots*/ ctx[9].controls;
    	const controls_slot = create_slot(controls_slot_template, ctx, /*$$scope*/ ctx[10], get_controls_slot_context);

    	return {
    		c() {
    			div = element("div");
    			if (controls_slot) controls_slot.c();
    			attr(div, "class", "controls svelte-lupfo5");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);

    			if (controls_slot) {
    				controls_slot.m(div, null);
    			}

    			current = true;
    		},
    		p(ctx, dirty) {
    			if (controls_slot) {
    				if (controls_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						controls_slot,
    						controls_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(controls_slot_template, /*$$scope*/ ctx[10], dirty, get_controls_slot_changes),
    						get_controls_slot_context
    					);
    				}
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(controls_slot, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(controls_slot, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (controls_slot) controls_slot.d(detaching);
    		}
    	};
    }

    // (19:2) <Portal>
    function create_default_slot$2(ctx) {
    	let div3;
    	let div0;
    	let t0;
    	let div2;
    	let t1;
    	let div1;
    	let t2;
    	let t3;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	const prepend_slot_template = /*#slots*/ ctx[9].prepend;
    	const prepend_slot = create_slot(prepend_slot_template, ctx, /*$$scope*/ ctx[10], get_prepend_slot_context);
    	let if_block0 = /*title*/ ctx[4] && !/*empty*/ ctx[2] && create_if_block_2$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[9].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[10], null);
    	let if_block1 = /*$$slots*/ ctx[8].controls && create_if_block_1$1(ctx);

    	return {
    		c() {
    			div3 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div2 = element("div");
    			if (prepend_slot) prepend_slot.c();
    			t1 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t2 = space();
    			if (default_slot) default_slot.c();
    			t3 = space();
    			if (if_block1) if_block1.c();
    			attr(div0, "class", "overlay svelte-lupfo5");
    			attr(div2, "class", "modal svelte-lupfo5");
    			toggle_class(div2, "full", /*fullScreen*/ ctx[6]);
    			toggle_class(div2, "modal--empty-desc", /*emptyDesc*/ ctx[3]);
    			toggle_class(div2, "modal--empty", /*empty*/ ctx[2]);
    			attr(div3, "class", "wrapper svelte-lupfo5");
    			set_style(div3, "--modal-width", /*width*/ ctx[5]);
    			set_style(div3, "z-index", /*z_index*/ ctx[1]);
    		},
    		m(target, anchor) {
    			insert(target, div3, anchor);
    			append(div3, div0);
    			append(div3, t0);
    			append(div3, div2);

    			if (prepend_slot) {
    				prepend_slot.m(div2, null);
    			}

    			append(div2, t1);
    			append(div2, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append(div1, t2);

    			if (default_slot) {
    				default_slot.m(div1, null);
    			}

    			append(div2, t3);
    			if (if_block1) if_block1.m(div2, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen(div0, "click", function () {
    					if (is_function(/*close*/ ctx[7])) /*close*/ ctx[7].apply(this, arguments);
    				});

    				mounted = true;
    			}
    		},
    		p(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (prepend_slot) {
    				if (prepend_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						prepend_slot,
    						prepend_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(prepend_slot_template, /*$$scope*/ ctx[10], dirty, get_prepend_slot_changes),
    						get_prepend_slot_context
    					);
    				}
    			}

    			if (/*title*/ ctx[4] && !/*empty*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, t2);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 1024)) {
    					update_slot_base(
    						default_slot,
    						default_slot_template,
    						ctx,
    						/*$$scope*/ ctx[10],
    						!current
    						? get_all_dirty_from_scope(/*$$scope*/ ctx[10])
    						: get_slot_changes(default_slot_template, /*$$scope*/ ctx[10], dirty, null),
    						null
    					);
    				}
    			}

    			if (/*$$slots*/ ctx[8].controls) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty & /*$$slots*/ 256) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_1$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div2, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*fullScreen*/ 64) {
    				toggle_class(div2, "full", /*fullScreen*/ ctx[6]);
    			}

    			if (dirty & /*emptyDesc*/ 8) {
    				toggle_class(div2, "modal--empty-desc", /*emptyDesc*/ ctx[3]);
    			}

    			if (dirty & /*empty*/ 4) {
    				toggle_class(div2, "modal--empty", /*empty*/ ctx[2]);
    			}

    			if (!current || dirty & /*width*/ 32) {
    				set_style(div3, "--modal-width", /*width*/ ctx[5]);
    			}

    			if (!current || dirty & /*z_index*/ 2) {
    				set_style(div3, "z-index", /*z_index*/ ctx[1]);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(prepend_slot, local);
    			transition_in(default_slot, local);
    			transition_in(if_block1);

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 100 }, true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o(local) {
    			transition_out(prepend_slot, local);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, fade, { duration: 100 }, false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div3);
    			if (prepend_slot) prepend_slot.d(detaching);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			if (if_block1) if_block1.d();
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*open*/ ctx[0] && create_if_block$1(ctx);

    	return {
    		c() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			if (/*open*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*open*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach(if_block_anchor);
    		}
    	};
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	const $$slots = compute_slots(slots);
    	const dispatch = createEventDispatcher();
    	let { z_index = 100 } = $$props;
    	let { empty = false } = $$props;
    	let { emptyDesc = false } = $$props;
    	let { title = '' } = $$props;
    	let { open = false } = $$props;
    	let { width = '40rem' } = $$props;
    	let { fullScreen = false } = $$props;

    	let { close = () => {
    		$$invalidate(0, open = false);
    		dispatch('modalClosed');
    	} } = $$props;

    	$$self.$$set = $$props => {
    		if ('z_index' in $$props) $$invalidate(1, z_index = $$props.z_index);
    		if ('empty' in $$props) $$invalidate(2, empty = $$props.empty);
    		if ('emptyDesc' in $$props) $$invalidate(3, emptyDesc = $$props.emptyDesc);
    		if ('title' in $$props) $$invalidate(4, title = $$props.title);
    		if ('open' in $$props) $$invalidate(0, open = $$props.open);
    		if ('width' in $$props) $$invalidate(5, width = $$props.width);
    		if ('fullScreen' in $$props) $$invalidate(6, fullScreen = $$props.fullScreen);
    		if ('close' in $$props) $$invalidate(7, close = $$props.close);
    		if ('$$scope' in $$props) $$invalidate(10, $$scope = $$props.$$scope);
    	};

    	return [
    		open,
    		z_index,
    		empty,
    		emptyDesc,
    		title,
    		width,
    		fullScreen,
    		close,
    		$$slots,
    		slots,
    		$$scope
    	];
    }

    class Modal extends SvelteComponent {
    	constructor(options) {
    		super();

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			z_index: 1,
    			empty: 2,
    			emptyDesc: 3,
    			title: 4,
    			open: 0,
    			width: 5,
    			fullScreen: 6,
    			close: 7
    		});
    	}
    }

    /* src/components/modals/EnterPasswordModal.svelte generated by Svelte v3.48.0 */

    function create_default_slot_1$1(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Confirm");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (10:0) <Modal {open}>
    function create_default_slot$1(ctx) {
    	let h2;
    	let t1;
    	let input;
    	let updating_value;
    	let t2;
    	let button;
    	let t3;
    	let div;
    	let t4;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[4](value);
    	}

    	let input_props = {};

    	if (/*password*/ ctx[2] !== void 0) {
    		input_props.value = /*password*/ ctx[2];
    	}

    	input = new Input({ props: input_props });
    	binding_callbacks.push(() => bind(input, 'value', input_value_binding));
    	input.$on("keypress", /*keypress_handler*/ ctx[5]);

    	button = new Button({
    			props: {
    				wide: true,
    				type: "accent",
    				$$slots: { default: [create_default_slot_1$1] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("keypress", /*keypress_handler_1*/ ctx[6]);
    	button.$on("click", /*click_handler*/ ctx[7]);

    	return {
    		c() {
    			h2 = element("h2");
    			h2.textContent = "Enter your password";
    			t1 = space();
    			create_component(input.$$.fragment);
    			t2 = space();
    			create_component(button.$$.fragment);
    			t3 = space();
    			div = element("div");
    			t4 = text(/*error*/ ctx[3]);
    			attr(div, "class", "error");
    		},
    		m(target, anchor) {
    			insert(target, h2, anchor);
    			insert(target, t1, anchor);
    			mount_component(input, target, anchor);
    			insert(target, t2, anchor);
    			mount_component(button, target, anchor);
    			insert(target, t3, anchor);
    			insert(target, div, anchor);
    			append(div, t4);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty & /*password*/ 4) {
    				updating_value = true;
    				input_changes.value = /*password*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    			const button_changes = {};

    			if (dirty & /*$$scope*/ 256) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    			if (!current || dirty & /*error*/ 8) set_data(t4, /*error*/ ctx[3]);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h2);
    			if (detaching) detach(t1);
    			destroy_component(input, detaching);
    			if (detaching) detach(t2);
    			destroy_component(button, detaching);
    			if (detaching) detach(t3);
    			if (detaching) detach(div);
    		}
    	};
    }

    function create_fragment$1(ctx) {
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				open: /*open*/ ctx[1],
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			}
    		});

    	return {
    		c() {
    			create_component(modal.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(modal, target, anchor);
    			current = true;
    		},
    		p(ctx, [dirty]) {
    			const modal_changes = {};
    			if (dirty & /*open*/ 2) modal_changes.open = /*open*/ ctx[1];

    			if (dirty & /*$$scope, error, confirmPassword, password*/ 269) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(modal, detaching);
    		}
    	};
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { confirmPassword } = $$props;
    	let { open = false } = $$props;
    	let password = '';
    	let error = '';

    	function input_value_binding(value) {
    		password = value;
    		$$invalidate(2, password);
    	}

    	const keypress_handler = e => {
    		if (e.key === 'Enter') {
    			e.preventDefault();
    			confirmPassword(password);
    		}
    	};

    	const keypress_handler_1 = e => {
    		if (e.key === 'Enter') {
    			e.preventDefault();
    			confirmPassword(password);
    		}
    	};

    	const click_handler = () => {
    		try {
    			confirmPassword(password);
    			$$invalidate(3, error = '');
    		} catch(e) {
    			$$invalidate(3, error = 'ERROR');
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('confirmPassword' in $$props) $$invalidate(0, confirmPassword = $$props.confirmPassword);
    		if ('open' in $$props) $$invalidate(1, open = $$props.open);
    	};

    	return [
    		confirmPassword,
    		open,
    		password,
    		error,
    		input_value_binding,
    		keypress_handler,
    		keypress_handler_1,
    		click_handler
    	];
    }

    class EnterPasswordModal extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { confirmPassword: 0, open: 1 });
    	}
    }

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

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[31] = list[i];
    	child_ctx[33] = i;
    	return child_ctx;
    }

    // (150:2) {:else}
    function create_else_block_1(ctx) {
    	let div;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block_4, create_if_block_5, create_else_block_2];
    	const if_blocks = [];

    	function select_block_type_2(ctx, dirty) {
    		if (/*createStep*/ ctx[10] == 1) return 0;
    		if (/*createStep*/ ctx[10] == 2) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type_2(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	return {
    		c() {
    			div = element("div");
    			if_block.c();
    			attr(div, "class", "create-box svelte-102w4ut");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_2(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};
    }

    // (85:2) {#if screen == 'LOGIN'}
    function create_if_block(ctx) {
    	let div;
    	let p0;
    	let t0;
    	let t1_value = reductId(/*wallet*/ ctx[6]) + "";
    	let t1;
    	let t2;
    	let i;
    	let t3;
    	let p1;
    	let t4;
    	let t5;
    	let t6;
    	let t7;
    	let current_block_type_index;
    	let if_block2;
    	let t8;
    	let button;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*copied*/ ctx[0] && create_if_block_3();
    	let if_block1 = /*isChangePassword*/ ctx[9] && create_if_block_2(ctx);
    	const if_block_creators = [create_if_block_1, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*isChangePassword*/ ctx[9]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	button = new Button({
    			props: {
    				type: "default",
    				wide: true,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click_handler_3*/ ctx[21]);

    	return {
    		c() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text("wallet: ");
    			t1 = text(t1_value);
    			t2 = space();
    			i = element("i");
    			if (if_block0) if_block0.c();
    			t3 = space();
    			p1 = element("p");
    			t4 = text("balance: ");
    			t5 = text(/*walletBalance*/ ctx[7]);
    			t6 = space();
    			if (if_block1) if_block1.c();
    			t7 = space();
    			if_block2.c();
    			t8 = space();
    			create_component(button.$$.fragment);
    			attr(i, "class", "fa-solid fa-copy");
    			attr(p0, "class", "info svelte-102w4ut");
    			attr(p1, "class", "info svelte-102w4ut");
    			attr(div, "class", "info-box svelte-102w4ut");
    		},
    		m(target, anchor) {
    			insert(target, div, anchor);
    			append(div, p0);
    			append(p0, t0);
    			append(p0, t1);
    			append(p0, t2);
    			append(p0, i);
    			if (if_block0) if_block0.m(p0, null);
    			append(div, t3);
    			append(div, p1);
    			append(p1, t4);
    			append(p1, t5);
    			insert(target, t6, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert(target, t7, anchor);
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert(target, t8, anchor);
    			mount_component(button, target, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen(i, "click", /*click_handler*/ ctx[16]);
    				mounted = true;
    			}
    		},
    		p(ctx, dirty) {
    			if ((!current || dirty[0] & /*wallet*/ 64) && t1_value !== (t1_value = reductId(/*wallet*/ ctx[6]) + "")) set_data(t1, t1_value);

    			if (/*copied*/ ctx[0]) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_3();
    					if_block0.c();
    					if_block0.m(p0, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty[0] & /*walletBalance*/ 128) set_data(t5, /*walletBalance*/ ctx[7]);

    			if (/*isChangePassword*/ ctx[9]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*isChangePassword*/ 512) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(t7.parentNode, t7);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block2 = if_blocks[current_block_type_index];

    				if (!if_block2) {
    					if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block2.c();
    				} else {
    					if_block2.p(ctx, dirty);
    				}

    				transition_in(if_block2, 1);
    				if_block2.m(t8.parentNode, t8);
    			}

    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(div);
    			if (if_block0) if_block0.d();
    			if (detaching) detach(t6);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach(t7);
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach(t8);
    			destroy_component(button, detaching);
    			mounted = false;
    			dispose();
    		}
    	};
    }

    // (174:6) {:else}
    function create_else_block_2(ctx) {
    	let h21;
    	let h20;
    	let t1;
    	let div;
    	let t2;
    	let h22;
    	let t4;
    	let input;
    	let updating_value;
    	let t5;
    	let button;
    	let current;
    	let each_value = /*myMnemonicWords*/ ctx[1];
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	function input_value_binding_1(value) {
    		/*input_value_binding_1*/ ctx[24](value);
    	}

    	let input_props = { class: "create" };

    	if (/*password*/ ctx[2] !== void 0) {
    		input_props.value = /*password*/ ctx[2];
    	}

    	input = new Input({ props: input_props });
    	binding_callbacks.push(() => bind(input, 'value', input_value_binding_1));
    	input.$on("keypress", /*keypress_handler*/ ctx[25]);

    	button = new Button({
    			props: {
    				type: "accent",
    				wide: true,
    				$$slots: { default: [create_default_slot_5] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*onChangePassword*/ ctx[13]);

    	return {
    		c() {
    			h21 = element("h2");
    			h20 = element("h2");
    			h20.textContent = "Your phrase is:";
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			h22 = element("h2");
    			h22.textContent = "Please save phrase and setup your Pin-code and continue:";
    			t4 = space();
    			create_component(input.$$.fragment);
    			t5 = space();
    			create_component(button.$$.fragment);
    			attr(div, "class", "phrase svelte-102w4ut");
    		},
    		m(target, anchor) {
    			insert(target, h21, anchor);
    			append(h21, h20);
    			append(h21, t1);
    			append(h21, div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			insert(target, t2, anchor);
    			insert(target, h22, anchor);
    			insert(target, t4, anchor);
    			mount_component(input, target, anchor);
    			insert(target, t5, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*myMnemonicWords*/ 2) {
    				each_value = /*myMnemonicWords*/ ctx[1];
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			const input_changes = {};

    			if (!updating_value && dirty[0] & /*password*/ 4) {
    				updating_value = true;
    				input_changes.value = /*password*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(input.$$.fragment, local);
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h21);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach(t2);
    			if (detaching) detach(h22);
    			if (detaching) detach(t4);
    			destroy_component(input, detaching);
    			if (detaching) detach(t5);
    			destroy_component(button, detaching);
    		}
    	};
    }

    // (161:32) 
    function create_if_block_5(ctx) {
    	let h2;
    	let t1;
    	let p;
    	let t3;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				wide: true,
    				type: "accent",
    				$$slots: { default: [create_default_slot_4] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click_handler_5*/ ctx[23]);

    	return {
    		c() {
    			h2 = element("h2");
    			h2.textContent = "To create a wallet need to generate and write down a seed phrase.";
    			t1 = space();
    			p = element("p");
    			p.textContent = "Please memorize the phrase and keep it in a safe place.";
    			t3 = space();
    			create_component(button.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, h2, anchor);
    			insert(target, t1, anchor);
    			insert(target, p, anchor);
    			insert(target, t3, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h2);
    			if (detaching) detach(t1);
    			if (detaching) detach(p);
    			if (detaching) detach(t3);
    			destroy_component(button, detaching);
    		}
    	};
    }

    // (152:6) {#if createStep == 1}
    function create_if_block_4(ctx) {
    	let h2;
    	let t1;
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				wide: true,
    				type: "accent",
    				$$slots: { default: [create_default_slot_3] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click_handler_4*/ ctx[22]);

    	return {
    		c() {
    			h2 = element("h2");
    			h2.textContent = "Welcome to the open wallet";
    			t1 = space();
    			create_component(button.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, h2, anchor);
    			insert(target, t1, anchor);
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h2);
    			if (detaching) detach(t1);
    			destroy_component(button, detaching);
    		}
    	};
    }

    // (178:12) {#each myMnemonicWords as word, id}
    function create_each_block(ctx) {
    	let span;
    	let t0_value = /*id*/ ctx[33] + 1 + "";
    	let t0;
    	let t1;
    	let t2_value = /*word*/ ctx[31] + "";
    	let t2;
    	let t3;

    	return {
    		c() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = text(".");
    			t2 = text(t2_value);
    			t3 = space();
    			attr(span, "class", "word svelte-102w4ut");
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    			append(span, t0);
    			append(span, t1);
    			append(span, t2);
    			append(span, t3);
    		},
    		p(ctx, dirty) {
    			if (dirty[0] & /*myMnemonicWords*/ 2 && t2_value !== (t2_value = /*word*/ ctx[31] + "")) set_data(t2, t2_value);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (194:8) <Button on:click={onChangePassword} type="accent" wide           >
    function create_default_slot_5(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Save pincode");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (166:8) <Button           wide           type="accent"           on:click={async () => {             await onCreateClick();             createStep++;           }}>
    function create_default_slot_4(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Generate phrase");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (154:8) <Button           wide           type="accent"           on:click={() => {             createStep++;           }}>
    function create_default_slot_3(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Create Wallet");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (95:10) {#if copied}
    function create_if_block_3(ctx) {
    	let span;

    	return {
    		c() {
    			span = element("span");
    			span.textContent = "Copied!";
    		},
    		m(target, anchor) {
    			insert(target, span, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(span);
    		}
    	};
    }

    // (103:4) {#if isChangePassword}
    function create_if_block_2(ctx) {
    	let h2;
    	let t1;
    	let input;
    	let updating_value;
    	let current;

    	function input_value_binding(value) {
    		/*input_value_binding*/ ctx[17](value);
    	}

    	let input_props = { class: "input" };

    	if (/*password*/ ctx[2] !== void 0) {
    		input_props.value = /*password*/ ctx[2];
    	}

    	input = new Input({ props: input_props });
    	binding_callbacks.push(() => bind(input, 'value', input_value_binding));
    	input.$on("change", /*change_handler*/ ctx[18]);

    	return {
    		c() {
    			h2 = element("h2");
    			h2.textContent = "Change Pin-Code";
    			t1 = space();
    			create_component(input.$$.fragment);
    		},
    		m(target, anchor) {
    			insert(target, h2, anchor);
    			insert(target, t1, anchor);
    			mount_component(input, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const input_changes = {};

    			if (!updating_value && dirty[0] & /*password*/ 4) {
    				updating_value = true;
    				input_changes.value = /*password*/ ctx[2];
    				add_flush_callback(() => updating_value = false);
    			}

    			input.$set(input_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(input.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(input.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(h2);
    			if (detaching) detach(t1);
    			destroy_component(input, detaching);
    		}
    	};
    }

    // (124:4) {:else}
    function create_else_block(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				wide: true,
    				type: "accent",
    				$$slots: { default: [create_default_slot_2] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click_handler_2*/ ctx[20]);

    	return {
    		c() {
    			create_component(button.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(button, detaching);
    		}
    	};
    }

    // (114:4) {#if isChangePassword}
    function create_if_block_1(ctx) {
    	let button;
    	let current;

    	button = new Button({
    			props: {
    				wide: true,
    				type: "accent",
    				$$slots: { default: [create_default_slot_1] },
    				$$scope: { ctx }
    			}
    		});

    	button.$on("click", /*click_handler_1*/ ctx[19]);

    	return {
    		c() {
    			create_component(button.$$.fragment);
    		},
    		m(target, anchor) {
    			mount_component(button, target, anchor);
    			current = true;
    		},
    		p(ctx, dirty) {
    			const button_changes = {};

    			if (dirty[1] & /*$$scope*/ 8) {
    				button_changes.$$scope = { dirty, ctx };
    			}

    			button.$set(button_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(button.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(button.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			destroy_component(button, detaching);
    		}
    	};
    }

    // (125:6) <Button         wide         type="accent"         on:click={() => {           isChangePassword = true;         }}>
    function create_default_slot_2(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Change Pin-Code");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (115:6) <Button         wide         type="accent"         on:click={async () => {           await Controller.saveWords(myMnemonicWords, password);           password = '';           isChangePassword = false;         }}>
    function create_default_slot_1(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Confirm Pin-Code");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    // (133:4) <Button       type="default"       wide       on:click={() => {         tg.sendData(           JSON.stringify({             wallet,             publicKey: keyPair.publicKey,             walletBalance,             action: 'walletDeleted',           })         );         storage.clear();         screen = 'WELCOME';         createStep = 1;       }}>
    function create_default_slot(ctx) {
    	let t;

    	return {
    		c() {
    			t = text("Delete Wallet");
    		},
    		m(target, anchor) {
    			insert(target, t, anchor);
    		},
    		d(detaching) {
    			if (detaching) detach(t);
    		}
    	};
    }

    function create_fragment(ctx) {
    	let main;
    	let div;
    	let t0;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let t2;
    	let enterpasswordmodal;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*screen*/ ctx[8] == 'LOGIN') return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	enterpasswordmodal = new EnterPasswordModal({
    			props: {
    				confirmPassword: /*onConfirmPassword*/ ctx[14],
    				open: /*passwordModalOpen*/ ctx[3]
    			}
    		});

    	return {
    		c() {
    			main = element("main");
    			div = element("div");
    			t0 = text(/*error*/ ctx[4]);
    			t1 = space();
    			if_block.c();
    			t2 = space();
    			create_component(enterpasswordmodal.$$.fragment);
    			attr(div, "class", "error svelte-102w4ut");
    			attr(main, "class", "svelte-102w4ut");
    		},
    		m(target, anchor) {
    			insert(target, main, anchor);
    			append(main, div);
    			append(div, t0);
    			append(main, t1);
    			if_blocks[current_block_type_index].m(main, null);
    			append(main, t2);
    			mount_component(enterpasswordmodal, main, null);
    			current = true;
    		},
    		p(ctx, dirty) {
    			if (!current || dirty[0] & /*error*/ 16) set_data(t0, /*error*/ ctx[4]);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, t2);
    			}

    			const enterpasswordmodal_changes = {};
    			if (dirty[0] & /*passwordModalOpen*/ 8) enterpasswordmodal_changes.open = /*passwordModalOpen*/ ctx[3];
    			enterpasswordmodal.$set(enterpasswordmodal_changes);
    		},
    		i(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(enterpasswordmodal.$$.fragment, local);
    			current = true;
    		},
    		o(local) {
    			transition_out(if_block);
    			transition_out(enterpasswordmodal.$$.fragment, local);
    			current = false;
    		},
    		d(detaching) {
    			if (detaching) detach(main);
    			if_blocks[current_block_type_index].d();
    			destroy_component(enterpasswordmodal);
    		}
    	};
    }

    const providerUrl = 'https://testnet.toncenter.com/api/v2/jsonRPC'; // TON HTTP API url. Use this url for testnet
    const apiKey = '36a585cf3e99d3c844e448b495c7b2f66bd279d4f4782540e1cf01ffa8833c50';
    const walletVersion = 'v3R2';

    function instance($$self, $$props, $$invalidate) {
    	let { name } = $$props;
    	let myMnemonicWords = [];
    	let password = '';
    	let passwordModalOpen = false;
    	let error = '';
    	let keyPair;
    	let walletContract;
    	let wallet;
    	let walletBalance;
    	let screen = 'WELCOME';
    	let copied = false;
    	let isChangePassword = false;
    	let createStep = 1;
    	const TonWeb = window.TonWeb;
    	const ton = new TonWeb(new TonWeb.HttpProvider(providerUrl, { apiKey }));
    	const tg = window.Telegram.WebApp;
    	const nacl = TonWeb.utils.nacl;

    	const loadInfo = async () => {
    		const privateKey = await Controller.wordsToPrivateKey(myMnemonicWords);
    		$$invalidate(5, keyPair = nacl.sign.keyPair.fromSeed(TonWeb.utils.base64ToBytes(privateKey)));
    		const WalletClass = ton.wallet.all[walletVersion];
    		walletContract = new WalletClass(ton.provider, { publicKey: keyPair.publicKey, wc: 0 });
    		$$invalidate(6, wallet = (await walletContract.getAddress()).toString(true, true, true));
    		const walletInfo = await ton.provider.getWalletInfo(wallet);
    		$$invalidate(7, walletBalance = controller.getBalance(walletInfo));
    	};

    	const onCreateClick = async () => {
    		$$invalidate(1, myMnemonicWords = await TonWeb.mnemonic.generateMnemonic());
    		console.log(myMnemonicWords);
    		await loadInfo();
    		console.log(password);
    	};

    	const onChangePassword = async () => {
    		await Controller.saveWords(myMnemonicWords, password);
    		$$invalidate(2, password = '');
    		$$invalidate(8, screen = 'LOGIN');

    		tg.sendData(JSON.stringify({
    			wallet,
    			publicKey: keyPair.publicKey,
    			walletBalance,
    			action: 'walletCreated'
    		}));
    	};

    	const onConfirmPassword = async pass => {
    		try {
    			$$invalidate(1, myMnemonicWords = await Controller.loadWords(pass));
    			await loadInfo();
    			$$invalidate(3, passwordModalOpen = false);
    			$$invalidate(4, error = '');
    		} catch(e) {
    			$$invalidate(4, error = 'ERROR');
    		}
    	};

    	onMount(async () => {
    		const words = await storage.getItem('words');

    		if (words) {
    			$$invalidate(3, passwordModalOpen = true);
    			$$invalidate(8, screen = 'LOGIN');
    		}
    	});

    	const click_handler = () => {
    		setClipboard(wallet);
    		$$invalidate(0, copied = true);
    	};

    	function input_value_binding(value) {
    		password = value;
    		$$invalidate(2, password);
    	}

    	const change_handler = async e => {
    		console.log(e);
    		console.log(password);
    	};

    	const click_handler_1 = async () => {
    		await Controller.saveWords(myMnemonicWords, password);
    		$$invalidate(2, password = '');
    		$$invalidate(9, isChangePassword = false);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(9, isChangePassword = true);
    	};

    	const click_handler_3 = () => {
    		tg.sendData(JSON.stringify({
    			wallet,
    			publicKey: keyPair.publicKey,
    			walletBalance,
    			action: 'walletDeleted'
    		}));

    		storage.clear();
    		$$invalidate(8, screen = 'WELCOME');
    		$$invalidate(10, createStep = 1);
    	};

    	const click_handler_4 = () => {
    		$$invalidate(10, createStep++, createStep);
    	};

    	const click_handler_5 = async () => {
    		await onCreateClick();
    		$$invalidate(10, createStep++, createStep);
    	};

    	function input_value_binding_1(value) {
    		password = value;
    		$$invalidate(2, password);
    	}

    	const keypress_handler = e => {
    		if (e.key === 'Enter') {
    			e.preventDefault();
    			onChangePassword();
    		}
    	};

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(15, name = $$props.name);
    	};

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*copied*/ 1) {
    			if (copied) {
    				setTimeout(
    					() => {
    						$$invalidate(0, copied = false);
    					},
    					2000
    				);
    			}
    		}
    	};

    	return [
    		copied,
    		myMnemonicWords,
    		password,
    		passwordModalOpen,
    		error,
    		keyPair,
    		wallet,
    		walletBalance,
    		screen,
    		isChangePassword,
    		createStep,
    		tg,
    		onCreateClick,
    		onChangePassword,
    		onConfirmPassword,
    		name,
    		click_handler,
    		input_value_binding,
    		change_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		input_value_binding_1,
    		keypress_handler
    	];
    }

    class App extends SvelteComponent {
    	constructor(options) {
    		super();
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 15 }, null, [-1, -1]);
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
