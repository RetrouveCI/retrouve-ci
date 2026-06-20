import { fireEvent, render } from '@testing-library/react-native';

import { Btn } from '@/components/Btn';

describe('Btn', () => {
  it('renders its label', async () => {
    const { getByText } = await render(<Btn label="Scanner" />);
    expect(getByText('Scanner')).toBeTruthy();
  });

  it('calls onPress when tapped', async () => {
    const onPress = jest.fn();
    const { getByText } = await render(<Btn label="Valider" onPress={onPress} />);
    fireEvent.press(getByText('Valider'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire onPress while loading', async () => {
    const onPress = jest.fn();
    const { getByRole } = await render(<Btn label="Envoi" onPress={onPress} loading />);
    fireEvent.press(getByRole('button'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
