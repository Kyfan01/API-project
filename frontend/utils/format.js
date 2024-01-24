export function formatDate(date) {

    let startDate = date?.split('T')[0]
    let startDateUS = `${startDate.split('-')[1]}/${startDate.split('-')[2]}/${startDate.split('-')[0]}`

    let startTime = `${date?.split('T')[1].split(':')[0]}:${date?.split('T')[1].split(':')[1]}`

    return [startDateUS, startTime]
}
