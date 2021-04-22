import { DataClass } from '../src/DataClass';

describe('DataClass', () => {
  class Person extends DataClass<Person> {
    name = 'Apple Bacon';
    phone = 5555555555;
    isPerson = true;

    get greeting() {
      return `Hello, ${this.name}.`;
    }
  }

  const default_person = new Person();
  const default_person_json = {
    name: 'Apple Bacon',
    phone: 5555555555,
    isPerson: true,
  }

  class Car extends DataClass<Car> {
    make = 'Shimwagon';
    owner = new Person();
    honk = () => 'Honk';
  }

  const default_car = new Car();

  it('does not allow mutation', () => {
    default_person.name = 'Clam Slam';
    expect(default_person.name).toBe('Apple Bacon');
  });

  it('supports addition getters', () => {
    expect(default_person.greeting).toBe('Hello, Apple Bacon.')
  });

  it('supports iterables', () => {
    expect(Object.entries(default_person)).toEqual([
      ['name', 'Apple Bacon'],
      ['phone', 5555555555],
      ['isPerson', true]
    ]);

    expect(Object.keys(default_person)).toEqual([
      'name', 'phone', 'isPerson'
    ]);
    
    expect(Object.values(default_person)).toEqual([
      'Apple Bacon', 5555555555, true
    ]);
  });

  it('supports serialization', () => {
    expect(JSON.stringify(default_person)).toBe(JSON.stringify(default_person_json));
  });

  it('supports nested updates', () => {
    const updated_car_owners_name = default_car
      .update({
        owner: default_car.owner.update({ name: 'Shanks Mackle' })
      });

    expect(JSON.stringify(updated_car_owners_name)).toBe(JSON.stringify({
      make: 'Shimwagon',
      owner: {
        name: 'Shanks Mackle',
        phone: 5555555555,
        isPerson: true,
      },
      honk: () => 'Honk' 
    }))
  });

  describe('to_json', () => {
    it('creates a new instance with default values', () => {
      expect(default_person.to_json()).toEqual(default_person_json);
    });
  
    it('overrides default values', () => {
      const test_person = new Person({
        name: 'Ham Sandwich',
        phone: 2222222222,
        isPerson: false,
      });
      
      expect(test_person.to_json()).toEqual({
        name: 'Ham Sandwich',
        phone: 2222222222,
        isPerson: false,
      });
    });
  });

  describe('update', () => {
    it('creates a new instance populated with changed data', () => {
      const initial_person = new Person({ name: 'Dane John' });
      const updated_person = initial_person.update({ phone: 3333333333 });
  
      // Check instance is different
      expect(initial_person).not.toEqual(updated_person);
  
      // Expect data to not me mutated
      expect(initial_person.to_json()).toEqual({
        name: 'Dane John',
        phone: 5555555555,
        isPerson: true,
      });
  
      // Expect data to have been changed
      expect(updated_person.to_json()).toEqual({
        name: 'Dane John',
        phone: 3333333333,
        isPerson: true,
      });
    });
  });

  describe('equals', () => {
    it('compares equal values of different instances', () => {
      const initial_person = new Person();
      expect(initial_person.equals(default_person)).toBe(true);
    });
    
    it('compares unequal values of different instances', () => {
      const initial_person = new Person();
      const changed_person = initial_person.update({ name: 'Fancy Pants' });
      expect(initial_person.equals(changed_person)).toBe(false);
    });

    it('compares nested dataclasses of equal value', () => {
      const default_car = new Car();
      const same_car = new Car();

      expect(default_car.equals(same_car)).toBe(true);
    });
    
    it('compares nested dataclasses of unequal value', () => {
      const default_car = new Car();
      const new_owner_car = new Car({
        owner: new Person({ name: 'Ham Sandwhich' }),
      });

      expect(default_car.equals(new_owner_car)).toBe(false);
    });

    it('equal functions return true', () => {
      const initial_car = new Car({
        honk: () => 'Beep'
      });
      const second_car = new Car({
        honk: () => 'Beep'
      });

      expect(initial_car.equals(second_car)).toBe(true);
    });

    it('unequal functions return false', () => {
      const initial_car = new Car({
        honk: () => 'Beep'
      });
      const second_car = new Car({
        honk: () => 'Awooga'
      });

      expect(initial_car.equals(second_car)).toBe(false);
    });
  });
});
