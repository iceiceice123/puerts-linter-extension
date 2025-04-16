// 测试数组拷贝规则

// bad - 使用for循环拷贝数组
function badArrayCopy1() {
    const items = [1, 2, 3, 4, 5];
    const itemsCopy = [];
    let i;

    for (i = 0; i < items.length; i += 1) {
        itemsCopy[i] = items[i];
    }
    
    return itemsCopy;
}

// bad - 使用长度变量的for循环拷贝数组
function badArrayCopy2() {
    const items = [1, 2, 3, 4, 5];
    const len = items.length;
    const itemsCopy = [];
    
    for (let i = 0; i < len; i++) {
        itemsCopy[i] = items[i];
    }
    
    return itemsCopy;
}

// good - 使用数组展开符拷贝数组
function goodArrayCopy() {
    const items = [1, 2, 3, 4, 5];
    const itemsCopy = [...items];
    
    return itemsCopy;
}

// good - 使用Array.from拷贝数组
function goodArrayCopy2() {
    const items = [1, 2, 3, 4, 5];
    const itemsCopy = Array.from(items);
    
    return itemsCopy;
}

// good - 使用slice拷贝数组
function goodArrayCopy3() {
    const items = [1, 2, 3, 4, 5];
    const itemsCopy = items.slice();
    
    return itemsCopy;
}
