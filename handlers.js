const getPing = (request, response) => {
    response.json({ 
        success: true,
        result: 'pong!' 
    });
}

export {
    getPing
}