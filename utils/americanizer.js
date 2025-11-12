function americanizer(text) {
    return text.split('').map((char) => {
        switch(char) {
            case 'a':
                return 'Da';
            case 'b':
                return 'Rren';
            case 'c':
                return 'ing';
            case 'd':
                return 'muri';
            case 'e':
                return 'ca';
            case 'f':
                return 'john';
            case 'g':
                return 'Lo';
            case 'h':
                return 'beer';
            case 'i':
                return 'freedom';
            case 'j':
                return 'burger';
            case 'k':
                return 'wha';
            case 'l':
                return 'ou';
            case 'm':   
                return 'UL';
            case 'n':
                return 'In';
            case 'o':
                return '4th of July';
            case 'p':   
                return 'football';
            case 'q':
                return 'ond';
            case 'r':
                return 'Le';
            case 's':
                return 'Spa';
            case 't':
                return 'N';
            case 'u':
                return 'Hi';
            case 'v':
                return 'Ra';
            case 'w':
                return 'D';
            case 'x':
                return 'Ge';
            case 'y':
                return 'Mississippi Queen';
            case 'z':
                return 'Hell yea';
            case ' ':
                return '  ';
            default:
                return '';
        }
    }).join('');
}

module.exports = americanizer;