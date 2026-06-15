                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{option.label}</div>
                      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 3 }}>{option.sub}</div>
                    </button>
                  ))}
                </div>
              </Section>

              {delivery !== 'metro' && (
                <Section>
                  <Label>Çatdırılma ünvanı</Label>
                  <Input
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder={delivery === 'post' ? 'Şəhər, poçt indeksi, ünvan' : 'Məhəllə, küçə, bina nömrəsi'}
                    autoComplete="street-address"
                    style={{ marginBottom: 10 }}
                  />
                  <Label>Çatdırılma günü</Label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8 }}>
                    <Select value={kurDay} onChange={setKurDay} options={DAYS_LIST} placeholder="Gün" />
                    <Select value={kurMonth} onChange={setKurMonth} options={MONTHS_AZ} placeholder="Ay" />
                    <Select value={kurYear} onChange={setKurYear} options={ORDER_YEARS} placeholder="İl" />
                  </div>
                </Section>
              )}

              {delivery === 'metro' && (
                <Section>
                  <Label>Metro stansiyası</Label>
                  <select
                    value={metro}
                    onChange={(event) => {
                      setMetro(event.target.value);
                      setMetroDay('');
                      setMetroTime('');
                    }}
                    style={{ width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 10, fontFamily: FONT }}
                  >
                    <option value="">Metro seçin</option>
                    {stations.map((station) => (
                      <option key={station.name} value={station.name}>{station.name}</option>
                    ))}
                  </select>

                  <Label>Gün</Label>
                  <select
                    value={metroDay}
                    onChange={(event) => {
                      setMetroDay(event.target.value);
                      setMetroTime('');
                    }}
                    style={{ width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, marginBottom: 10, fontFamily: FONT }}
                  >
                    <option value="">Gün seçin</option>
                    {metroDays.map((day) => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>

                  <Label>Saat</Label>
                  <select
                    value={metroTime}
                    onChange={(event) => setMetroTime(event.target.value)}
                    style={{ width: '100%', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12, fontFamily: FONT }}
                  >
                    <option value="">Saat seçin</option>
                    {metroTimes.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </Section>
              )}

              <Section>
                <Label>Əlaqə məlumatları</Label>
                <Input value={custName} onChange={(event) => setCustName(event.target.value)} placeholder="Adınız" autoComplete="name" style={{ marginBottom: 10 }} />
                <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Telefon (+994 50 xxx xx xx)" type="tel" autoComplete="tel" style={{ marginBottom: 10 }} />
                <Label>Doğum tarixi</Label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 8 }}>
                  <Select value={bdDay} onChange={setBdDay} options={DAYS_LIST} placeholder="Gün" />
                  <Select value={bdMonth} onChange={setBdMonth} options={MONTHS_AZ} placeholder="Ay" />
                  <Select value={bdYear} onChange={setBdYear} options={BIRTH_YEARS} placeholder="İl" />
                </div>
              </Section>

              <Section>
                <Label>Sifariş xülasəsi</Label>
                {items.map((item) => (
                  <div key={item.cartId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: C.gray }}>{item.productName} ×{item.quantity}</span>
                    <strong>{money(getItemSubtotal(item))}</strong>
                  </div>
                ))}
                {deliveryFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                    <span style={{ color: C.gray }}>Çatdırılma</span>
                    <strong>{money(deliveryFee)}</strong>
                  </div>
                )}
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 10, marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span>Ümumi</span>
                    <strong>{money(grandTotal)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: C.orange }}>
                    <span>Beh 50%</span>
                    <strong>{money(deposit)}</strong>
                  </div>
                </div>
              </Section>

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: C.red, borderRadius: 8, padding: 12, fontSize: 13, marginBottom: 12 }}>
                  {error}
                </div>
              )}
            </div>

            <div style={{ padding: '14px 20px 28px', background: C.white, borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
              {!checkoutValid && (
                <p style={{ fontSize: 12, color: C.grayLt, textAlign: 'center', margin: '0 0 10px' }}>
                  Bütün məcburi xanaları doldurun
                </p>
              )}
              <button
                disabled={!checkoutValid || isSubmitting}
                onClick={handleWhatsApp}
                style={{
                  width: '100%',
                  padding: 15,
                  borderRadius: 8,
                  border: 'none',
                  background: checkoutValid && !isSubmitting ? '#25D366' : C.bg,
                  color: checkoutValid && !isSubmitting ? C.white : C.grayLt,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: checkoutValid && !isSubmitting ? 'pointer' : 'not-allowed',
                  fontFamily: FONT,
                }}
              >
                {isSubmitting ? 'Sifariş yazılır...' : 'WhatsApp ilə göndər'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;