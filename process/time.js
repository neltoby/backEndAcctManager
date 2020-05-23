time = (td) => {
    let date = new Date(td)
    let month = date.getMonth()
    let yr = date.getFullYear()
    let day = date.getDay()
    let allmonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${allmonth[month]} ${day}, ${yr}`
}

module.exports = time