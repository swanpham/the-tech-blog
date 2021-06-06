const { expect, test } = require('@jest/globals');
const { 
    format_date,
    format_plural,
    format_url
 } = require( '../utils/helpers' );

test( 'format_date() returns a date string', () => {
    const date = new Date('2021-05-21 20:33:02');

    expect( format_date( date )).toBe( '5/21/2021' )
})

test ('check format_plural() to return plural string', () => {
    const word = 'comment'
    const number = 2

    expect( format_plural( word, number ) ).toBe( 'comments' )
})

test( 'format url() returns a simplified url string', () => {
    const url1 = format_url('http://test.com/page/1');
    const url2 = format_url('https://www.coolstuff.com/abcdefg/');
    const url3 = format_url('https://www.google.com?q=hello');

    expect(url1).toBe('test.com');
    expect(url2).toBe('coolstuff.com');
    expect(url3).toBe('google.com');
})