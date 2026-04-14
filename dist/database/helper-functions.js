import { promises as fsPromises } from 'fs';
import { join } from 'path';
import { json } from 'stream/consumers';
export async function asyncWriteFile(filename, data) {
    try {
        await fsPromises.writeFile(join("src/database/", filename), data, {
            flag: 'w',
        });
    }
    catch (err) {
        console.log(err);
        return 'Something went wrong';
    }
}
export async function asyncReadFile(filename) {
    try {
        const contents = await fsPromises.readFile(join("src/database/", filename), 'utf-8');
        return contents;
    }
    catch (err) {
        console.log(err);
        return 'Something went wrong';
    }
}
// asyncWriteFile('data.json', JSON.stringify({name: 'John', age: 30}, null, 2));
//
// asyncReadFile('data.json').then((data) => {
//     console.log(JSON.parse(data));
// });
//# sourceMappingURL=helper-functions.js.map