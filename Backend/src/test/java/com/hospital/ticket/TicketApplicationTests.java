package com.hospital.ticket;
import static org.junit.jupiter.api.Assertions.assertEquals;

import com.hospital.ticket.utils.Utils;


import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

class TicketApplicationTests {

	@Test
	void testRecalculateNewTime(){
		assertEquals("17:00", Utils.recalculateNewTime("17:10", 10));
		assertEquals("23:55", Utils.recalculateNewTime("00:15", 20));
		assertEquals("23:45", Utils.recalculateNewTime("00:00", 15));
		assertEquals("09:50", Utils.recalculateNewTime("10:00", 10));
	}
}
