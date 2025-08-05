import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvFileSource;
import static org.junit.jupiter.api.Assertions.*;

public class EDUChainStakingTest {
    @ParameterizedTest
    @CsvFileSource(resources = "/test_combinations.csv", numLinesToSkip = 1)
    void testStaking(String role, String action, int amount) {
        // Проверка валидности роли
        assertTrue(role.equals("Student") || role.equals("Professor"));

        // Проверка допустимых действий
        assertTrue(action.equals("Mint") || action.equals("Transfer") || action.equals("Burn"));

        // Проверка диапазона amount
        assertTrue(amount >= 10 && amount <= 1000);
    }
}