// 处理是否有试题解析
export function hasAnaysis (data) {
    if (data instanceof Array) {
        return false
    } else {
        return data
    }
}
