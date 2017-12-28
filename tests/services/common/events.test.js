const JimpleMock = require('/tests/mocks/jimple.mock');

jest.mock('jimple', () => JimpleMock);
jest.mock('fs-extra');
jest.unmock('/src/services/common/events');

require('jasmine-expect');
const { EventsHub } = require('wootils/shared');
const { Events, events } = require('/src/services/common/events');

describe('services/common:events', () => {
  it('should be a subclass of EventsHub', () => {
    // Given
    let sut = null;
    // When
    sut = new Events();
    // Then
    expect(sut).toBeInstanceOf(Events);
    expect(sut).toBeInstanceOf(EventsHub);
  });

  it('should include a provider for the DIC', () => {
    // Given
    const container = {
      set: jest.fn(),
    };
    let serviceName = null;
    let serviceFn = null;
    // When
    events(container);
    [[serviceName, serviceFn]] = container.set.mock.calls;
    // Then
    expect(serviceName).toBe('events');
    expect(serviceFn).toBeFunction();
    expect(serviceFn()).toBeInstanceOf(Events);
  });
});
