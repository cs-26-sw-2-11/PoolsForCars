import { fakerDA as faker } from '@faker-js/faker';
faker.seed(69420);
export function createRandomUser() {
    return {
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        phoneNumber: faker.phone.number({ style: "national" }),
    };
}
export const users = faker.helpers.multiple(createRandomUser, {
    count: 100,
});
console.log(users);
//# sourceMappingURL=user.seeder.js.map