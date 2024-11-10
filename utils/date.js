const formatDate = (seconds, nanoseconds) => {
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;

    return new Date(milliseconds);
}


export {
    formatDate
}