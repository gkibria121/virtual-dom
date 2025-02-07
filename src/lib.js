const CREATE = "CREATE";
const REMOVE = "REMOVE";
const REPLACE = "REPLACE";
const UPDATE = "UPDATE";
const SET_PROP = "SET_PROP";
const REMOVE_PROP = "REMOVE_PROP";

function view(state) {
  const lis = [...Array(state).keys()];
  // Format the text to ensure consistent display
  const liEls = lis.map((li) => h("li", null, `Text ${li}`));
  return h("ul", { className: "hd" }, liEls);
}

function flatten(children) {
  return children.flat().filter((child) => child != null);
}

function h(type, props, ...children) {
  return {
    type,
    props: props || {},
    children: flatten(children),
  };
}

function createElement(node) {
  if (typeof node === "string" || typeof node === "number") {
    return document.createTextNode(node.toString());
  }

  const el = document.createElement(node.type);
  setProps(el, node.props);
  node.children.map(createElement).forEach((child) => el.appendChild(child));
  return el;
}

function setProps(target, props) {
  Object.keys(props).forEach((key) => {
    setProp(target, key, props[key]);
  });
}

function setProp(target, key, value) {
  if (key === "className") {
    target.setAttribute("class", value);
  } else {
    target.setAttribute(key, value);
  }
}

function changed(newNode, oldNode) {
  return (
    typeof newNode !== typeof oldNode ||
    (typeof newNode === "string" && newNode !== oldNode) ||
    (newNode && oldNode && newNode.type !== oldNode.type)
  );
}

function diff(newNode, oldNode) {
  if (!oldNode) {
    return { type: CREATE, newNode };
  }
  if (!newNode) {
    return { type: REMOVE };
  }
  if (changed(newNode, oldNode)) {
    return { type: REPLACE, newNode };
  }
  if (newNode.type) {
    const patches = diffChildren(newNode, oldNode);
    if (patches.length > 0) {
      return {
        type: UPDATE,
        children: patches,
      };
    }
    return null;
  }
  return null;
}

function diffChildren(newNode, oldNode) {
  const patches = [];
  const patchesLength = Math.max(newNode.children.length, oldNode.children.length);

  for (let i = 0; i < patchesLength; i++) {
    const patch = diff(newNode.children[i], oldNode.children[i]);
    if (patch) {
      patches[i] = patch;
    }
  }
  return patches;
}

function patch(parent, patches, index = 0) {
  if (!patches) return;

  const el = parent.childNodes[index];

  switch (patches.type) {
    case CREATE: {
      const newEl = createElement(patches.newNode);
      parent.appendChild(newEl);
      break;
    }
    case REMOVE: {
      if (el) {
        parent.removeChild(el);
      }
      break;
    }
    case REPLACE: {
      const newEl = createElement(patches.newNode);
      if (el) {
        parent.replaceChild(newEl, el);
      } else {
        parent.appendChild(newEl);
      }
      break;
    }
    case UPDATE: {
      const { children } = patches;
      children.forEach((childPatch, i) => {
        patch(el, childPatch, i);
      });
      break;
    }
  }
}

function render(el) {
  const initialView = view(0);
  el.appendChild(createElement(initialView));
  tick(el, 0);
}

function tick(el, count) {
  const newView = view(count + 1);
  const oldView = view(count);
  const patches = diff(newView, oldView);

  if (patches) {
    patch(el, patches);
  }

  if (count > 20) return;

  setTimeout(() => {
    tick(el, count + 1);
  }, 500);
}
