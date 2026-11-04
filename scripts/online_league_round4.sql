insert into online_league_matches
  (round, player1_id, player2_id)
select 4, p1::uuid, p2::uuid
from (values
('026fe54f-a330-4678-9197-7617b6076627','5afb211e-fd3f-481f-8c05-06095ff16aa1'),
('652373f5-adfc-478b-8b35-4d5f7fb51886','25d5b2fa-4024-4d90-b1ee-8e136a8b2449'),
('1be191e3-f761-492f-bbb7-5f8b279844f2','86f2d4f9-0fad-4c6c-a824-79a3b2de01e1'),
('6a6c8a75-c87c-4f86-8f96-a8c6f63d3631','3e41aa5a-78c2-4937-a048-c90379b4f945'),
('222e7c3f-0dcd-4cfc-89bb-8ba897a28a30','b2b1670d-5ca7-49f7-82e0-0bbd456dd0b5'),
('d7da0d21-3c32-471e-ae2f-47e750da4ca0','7cd50283-f918-4591-b0c4-9779aa2a1cf5'),
('9ff065f2-a94a-4f2d-83d0-6d7ef723b8af','f477ecb9-245a-46db-8c05-786957132e7f'),
('05116118-857a-4070-9797-0697c7b2ad32','ca9b12d9-c78d-4095-9979-779da3d97711'),
('54c2f731-677b-43a7-931d-9ba30e765e30','d4045c6c-e2d7-4cd8-a67f-f1dd12803e9d'),
('6abd41d6-4318-43d1-9a3c-9eb70b8d4ef4','416554cb-569f-4201-94a7-7f932d87af8a'),
('deea2b7c-1d83-41b4-a197-efdf45827b67','c6030ce9-a4e3-4d13-979d-92c63755dc81'),
('1e27d179-3a71-4c9e-995c-9d789e9db7d8','7c71b0dc-9764-405f-866e-d184a54b079f'),
('48146f61-5a2f-4258-a923-8b06477d1b69','20a6a6cc-c100-45af-9bc1-b00e6df11958'),
('e2bb6946-f36a-4084-8f1e-2d3f0fadc9f7','3a76040c-884e-4e4f-9246-cb70a20385a4'),
('b8d154e8-021c-47ba-abb0-3e4c6b98dfc4','93f323cb-6ac6-4e3b-948f-23189c15f98d')
) as v(p1, p2)
where not exists
  (select 1 from online_league_matches where round = 4);
